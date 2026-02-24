import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:5000';

const ST = {
  available:   { bg:'rgba(20,80,40,0.3)',  color:'#4ade80', border:'rgba(74,222,128,0.3)',  label:'AVAILABLE'   },
  reserved:    { bg:'rgba(80,60,10,0.3)',  color:'#fbbf24', border:'rgba(251,191,36,0.3)',  label:'RESERVED'    },
  rented:      { bg:'rgba(155,28,49,0.2)', color:'#f87171', border:'rgba(248,113,113,0.3)', label:'RENTED'      },
  maintenance: { bg:'rgba(60,40,10,0.3)',  color:'#f59e0b', border:'rgba(245,158,11,0.3)',  label:'MAINTENANCE' },
  inactive:    { bg:'rgba(30,30,46,0.5)',  color:'#6b7280', border:'rgba(107,114,128,0.3)', label:'INACTIVE'    },
};

const EMPTY = { make:'',model:'',year:new Date().getFullYear(),category:'sedan',transmission:'automatic',fuelType:'gasoline',seats:5,color:'',plateNumber:'',mileage:0,dailyRate:'',locationId:'',imageUrl:'',status:'available' };

const useAdminAuth = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) { navigate('/admin/login'); return; }
    try {
      const p = JSON.parse(atob(token.split('.')[1]));
      if (p.exp * 1000 < Date.now()) { localStorage.removeItem('adminToken'); navigate('/admin/login'); }
    } catch { navigate('/admin/login'); }
  }, [navigate]);
  return localStorage.getItem('adminToken');
};

const AdminFleet = () => {
  const navigate = useNavigate();
  const token    = useAdminAuth();
  const [vehicles,   setVehicles]   = useState([]);
  const [locations,  setLocations]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showModal,  setShowModal]  = useState(false);
  const [editMode,   setEditMode]   = useState(false);
  const [form,       setForm]       = useState(EMPTY);
  const [saving,     setSaving]     = useState(false);
  const [search,     setSearch]     = useState('');
  const [filterSt,   setFilterSt]   = useState('all');
  const [confirmDel, setConfirmDel] = useState(null);
  const headers = { Authorization:`Bearer ${token}` };

  const load = async () => {
    setLoading(true);
    try {
      const [vRes, lRes] = await Promise.all([
        axios.get(`${API}/api/admin/vehicles`,  {headers}),
        axios.get(`${API}/api/admin/locations`, {headers}),
      ]);
      setVehicles(vRes.data); setLocations(lRes.data);
    } catch(err) {
      if (err.response?.status===401||err.response?.status===403) { localStorage.removeItem('adminToken'); navigate('/admin/login'); }
    } finally { setLoading(false); }
  };

  useEffect(()=>{ if(token) load(); },[token]);

  const openAdd  = () => { setForm(EMPTY); setEditMode(false); setShowModal(true); };
  const openEdit = (v) => {
    setForm({ make:v.make,model:v.model,year:v.year,category:v.category,transmission:v.transmission,fuelType:v.fuelType,seats:v.seats,color:v.color||'',plateNumber:v.plateNumber,mileage:v.mileage,dailyRate:v.dailyRate,locationId:v.locationId||'',imageUrl:v.imageUrl||'',status:v.status,_id:v.id });
    setEditMode(true); setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.make||!form.model||!form.plateNumber||!form.dailyRate) return alert("Please fill all required fields.");
    setSaving(true);
    try {
      if (editMode) await axios.put(`${API}/api/admin/vehicles/${form._id}`, form, {headers});
      else          await axios.post(`${API}/api/admin/vehicles`, form, {headers});
      setShowModal(false); load();
    } catch(err) { alert(err.response?.data?.error||"Failed to save."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await axios.delete(`${API}/api/admin/vehicles/${id}`, {headers}); setConfirmDel(null); load(); }
    catch(err) { alert(err.response?.data?.error||"Cannot delete."); }
  };

  const F = (k,v) => setForm(f=>({...f,[k]:v}));
  const filtered = vehicles.filter(v => {
    const s = `${v.make} ${v.model} ${v.plateNumber}`.toLowerCase().includes(search.toLowerCase());
    const t = filterSt==='all' || (v.computedStatus||v.status)===filterSt;
    return s && t;
  });
  const stats = {
    total:       vehicles.length,
    available:   vehicles.filter(v=>(v.computedStatus||v.status)==='available').length,
    rented:      vehicles.filter(v=>(v.computedStatus||v.status)==='rented').length,
    maintenance: vehicles.filter(v=>(v.computedStatus||v.status)==='maintenance').length,
  };

  return (
    <div style={S.wrapper}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Montserrat:wght@300;400;500;600;700;800&display=swap');
        tr:hover td { background: rgba(155,28,49,0.05) !important; }
        input::placeholder, textarea::placeholder { color: #3a3a50; }
        select option { background: #0e0e14; color: #f0f2f8; }
      `}</style>

      {/* Header */}
      <div style={S.header}>
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          <div style={S.logoBox}>R</div>
          <div>
            <h1 style={S.headerTitle}>FLEET MANAGEMENT</h1>
            <p style={S.headerSub}>Rental 10 — Admin Panel</p>
          </div>
        </div>
        <div style={{ display:'flex', gap:'10px' }}>
          <button style={S.btnAdd} onClick={openAdd}>+ ADD VEHICLE</button>
          <button style={S.btnExit} onClick={()=>{ localStorage.removeItem('adminToken'); navigate('/catalog'); }}>EXIT</button>
        </div>
      </div>

      <div style={{ padding:'0 32px' }}>
        {/* Stats */}
        <div style={S.statsRow}>
          {[{l:'TOTAL FLEET',v:stats.total,c:'#c8cdd6'},{l:'AVAILABLE',v:stats.available,c:'#4ade80'},{l:'RENTED',v:stats.rented,c:'#f87171'},{l:'MAINTENANCE',v:stats.maintenance,c:'#f59e0b'}].map(s=>(
            <div key={s.l} style={S.statCard}>
              <span style={{color:s.c,fontSize:'2.2rem',fontWeight:800,fontFamily:"'Cormorant Garamond',serif"}}>{s.v}</span>
              <span style={{color:'#4a5060',fontSize:'.6rem',letterSpacing:'3px',fontWeight:700}}>{s.l}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={S.filterRow}>
          <div style={S.searchWrap}>
            <span style={S.searchIcon}>⌕</span>
            <input placeholder="Search make, model or plate..." value={search} onChange={e=>setSearch(e.target.value)} style={S.searchInput}/>
          </div>
          <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
            {['all','available','reserved','rented','maintenance','inactive'].map(st=>(
              <button key={st} style={{...S.filterBtn, background:filterSt===st?'rgba(155,28,49,0.3)':'transparent', color:filterSt===st?'#f0f2f8':'#4a5060', border:filterSt===st?'1px solid rgba(155,28,49,0.6)':'1px solid #1e1e2e'}} onClick={()=>setFilterSt(st)}>
                {st.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? <div style={S.center}>Loading fleet data...</div> : (
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr style={{borderBottom:'1px solid #9b1c31'}}>
                  {['','VEHICLE','PLATE','CATEGORY','DAILY RATE','STATUS','MILEAGE','LOCATION',''].map((h,i)=>(
                    <th key={i} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => {
                  const st = v.computedStatus||v.status;
                  const badge = ST[st]||ST.inactive;
                  return (
                    <tr key={v.id} style={{borderBottom:'1px solid #1e1e2e',transition:'background .15s'}}>
                      <td style={S.td}>
                        <img src={v.imageUrl||`https://placehold.co/90x55/0e0e14/4a5060?text=${v.make}`} alt={v.model}
                          style={{width:'90px',height:'55px',objectFit:'cover',borderRadius:'4px',border:'1px solid #1e1e2e'}}
                          onError={e=>{e.target.src=`https://placehold.co/90x55/0e0e14/4a5060?text=${v.make}`;}}/>
                      </td>
                      <td style={S.td}>
                        <div style={{fontWeight:600,color:'#f0f2f8',fontFamily:"'Cormorant Garamond',serif",fontSize:'1.1rem'}}>{v.make} {v.model}</div>
                        <div style={{color:'#4a5060',fontSize:'.72rem',letterSpacing:'1px'}}>{v.year} · {v.transmission} · {v.fuelType}</div>
                      </td>
                      <td style={{...S.td,fontFamily:'monospace',color:'#9b1c31',letterSpacing:'2px',fontSize:'.85rem'}}>{v.plateNumber}</td>
                      <td style={{...S.td,color:'#8a909e',textTransform:'capitalize',fontSize:'.82rem',letterSpacing:'1px'}}>{v.category}</td>
                      <td style={{...S.td,fontFamily:"'Cormorant Garamond',serif",fontSize:'1.1rem',fontWeight:700,color:'#c8cdd6'}}>${Number(v.dailyRate).toFixed(2)}</td>
                      <td style={S.td}>
                        <span style={{background:badge.bg,color:badge.color,border:`1px solid ${badge.border}`,borderRadius:'2px',padding:'4px 10px',fontSize:'.62rem',fontWeight:700,letterSpacing:'2px'}}>{badge.label}</span>
                      </td>
                      <td style={{...S.td,color:'#4a5060',fontSize:'.82rem'}}>{Number(v.mileage).toLocaleString()} mi</td>
                      <td style={{...S.td,color:'#6a7080',fontSize:'.78rem'}}>{v.locationName||'—'}</td>
                      <td style={S.td}>
                        <div style={{display:'flex',gap:'6px'}}>
                          <button style={S.btnEdit} onClick={()=>openEdit(v)}>EDIT</button>
                          <button style={S.btnDel}  onClick={()=>setConfirmDel(v)}>✕</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length===0 && <tr><td colSpan={9} style={{...S.td,textAlign:'center',color:'#4a5060',padding:'60px',letterSpacing:'2px',fontSize:'.8rem'}}>NO VEHICLES FOUND</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div style={S.modal}>
            <div style={S.modalTop}/>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'28px'}}>
              <h2 style={{color:'#f0f2f8',fontFamily:"'Cormorant Garamond',serif",fontSize:'1.8rem',letterSpacing:'3px'}}>
                {editMode?'EDIT VEHICLE':'ADD VEHICLE'}
              </h2>
              <button style={S.closeBtn} onClick={()=>setShowModal(false)}>✕</button>
            </div>
            <div style={S.formGrid}>
              {[['MAKE *','make','text','Toyota'],['MODEL *','model','text','Camry'],['YEAR *','year','number',null],['DAILY RATE ($) *','dailyRate','number','99.99'],['PLATE *','plateNumber','text','ABC-1234'],['COLOR','color','text','Midnight Black'],['SEATS','seats','number',null],['MILEAGE','mileage','number',null]].map(([lbl,key,type,ph])=>(
                <div key={key} style={S.field}>
                  <label style={S.lbl}>{lbl}</label>
                  <input style={S.inp} type={type} placeholder={ph||''} value={form[key]} onChange={e=>F(key,e.target.value)}/>
                </div>
              ))}
              <div style={S.field}>
                <label style={S.lbl}>CATEGORY</label>
                <select style={S.inp} value={form.category} onChange={e=>F('category',e.target.value)}>
                  {['sedan','SUV','economy','luxury'].map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={S.field}>
                <label style={S.lbl}>TRANSMISSION</label>
                <select style={S.inp} value={form.transmission} onChange={e=>F('transmission',e.target.value)}>
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
              <div style={S.field}>
                <label style={S.lbl}>FUEL TYPE</label>
                <select style={S.inp} value={form.fuelType} onChange={e=>F('fuelType',e.target.value)}>
                  {['gasoline','diesel','electric','hybrid'].map(f=><option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div style={S.field}>
                <label style={S.lbl}>LOCATION</label>
                <select style={S.inp} value={form.locationId} onChange={e=>F('locationId',e.target.value)}>
                  <option value="">— Select —</option>
                  {locations.map(l=><option key={l.id} value={l.id}>{l.name} — {l.city}</option>)}
                </select>
              </div>
              {editMode && (
                <div style={S.field}>
                  <label style={S.lbl}>STATUS (OVERRIDE)</label>
                  <select style={S.inp} value={form.status} onChange={e=>F('status',e.target.value)}>
                    {['available','maintenance','inactive'].map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}
              <div style={{...S.field,gridColumn:'1 / -1'}}>
                <label style={S.lbl}>IMAGE URL</label>
                <input style={S.inp} placeholder="https://..." value={form.imageUrl} onChange={e=>F('imageUrl',e.target.value)}/>
                {form.imageUrl && <img src={form.imageUrl} alt="preview" style={{marginTop:'10px',width:'100%',height:'130px',objectFit:'cover',borderRadius:'4px',border:'1px solid #1e1e2e'}} onError={e=>e.target.style.display='none'}/>}
              </div>
            </div>
            <div style={{display:'flex',gap:'10px',marginTop:'24px'}}>
              <button style={{...S.btnAdd,flex:1,opacity:saving?.6:1,padding:'14px'}} onClick={handleSave} disabled={saving}>
                {saving?'SAVING...':(editMode?'SAVE CHANGES':'ADD VEHICLE')}
              </button>
              <button style={{...S.btnExit,padding:'14px 24px'}} onClick={()=>setShowModal(false)}>CANCEL</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {confirmDel && (
        <div style={S.overlay}>
          <div style={{...S.modal,maxWidth:'400px',textAlign:'center'}}>
            <div style={S.modalTop}/>
            <div style={{fontSize:'2.5rem',marginBottom:'12px',fontFamily:"'Cormorant Garamond',serif",color:'#f87171'}}>⚠</div>
            <h3 style={{color:'#f0f2f8',fontFamily:"'Cormorant Garamond',serif",fontSize:'1.6rem',letterSpacing:'2px',marginBottom:'8px'}}>CONFIRM DELETE</h3>
            <p style={{color:'#6a7080',fontSize:'.82rem',letterSpacing:'1px',marginBottom:'24px',lineHeight:1.6}}>
              <strong style={{color:'#c8cdd6'}}>{confirmDel.make} {confirmDel.model}</strong> ({confirmDel.plateNumber})<br/>will be permanently removed from the system.
            </p>
            <div style={{display:'flex',gap:'10px'}}>
              <button style={{...S.btnDel,flex:1,padding:'12px',borderRadius:'3px',fontSize:'.78rem',letterSpacing:'2px'}} onClick={()=>handleDelete(confirmDel.id)}>DELETE</button>
              <button style={{...S.btnEdit,flex:1,padding:'12px',borderRadius:'3px',fontSize:'.78rem',letterSpacing:'2px'}} onClick={()=>setConfirmDel(null)}>CANCEL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const S = {
  wrapper:    {background:'#050508',minHeight:'100vh',fontFamily:"'Montserrat',sans-serif",color:'#f0f2f8'},
  header:     {background:'#0e0e14',borderBottom:'1px solid #9b1c31',padding:'20px 32px',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,zIndex:100,boxShadow:'0 2px 20px rgba(155,28,49,0.15)'},
  logoBox:    {width:'40px',height:'40px',borderRadius:'6px',background:'linear-gradient(135deg,#9b1c31,#5c0f20)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Cormorant Garamond',serif",fontSize:'1.4rem',fontWeight:700,color:'#f0f2f8',boxShadow:'0 0 20px rgba(155,28,49,0.4)'},
  headerTitle:{fontFamily:"'Cormorant Garamond',serif",fontSize:'1.5rem',letterSpacing:'4px',margin:0,textTransform:'uppercase'},
  headerSub:  {color:'#4a5060',fontSize:'.62rem',letterSpacing:'3px',margin:'3px 0 0',textTransform:'uppercase'},
  statsRow:   {display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px',padding:'24px 0'},
  statCard:   {background:'#0e0e14',border:'1px solid #1e1e2e',borderRadius:'4px',padding:'24px',display:'flex',flexDirection:'column',alignItems:'center',gap:'6px',position:'relative',overflow:'hidden'},
  filterRow:  {display:'flex',gap:'14px',paddingBottom:'20px',flexWrap:'wrap',alignItems:'center'},
  searchWrap: {position:'relative',flex:1,minWidth:'220px'},
  searchIcon: {position:'absolute',left:'14px',top:'50%',transform:'translateY(-50%)',color:'#4a5060',fontSize:'1.1rem'},
  searchInput:{width:'100%',background:'#0e0e14',border:'1px solid #1e1e2e',borderRadius:'3px',color:'#f0f2f8',padding:'10px 14px 10px 38px',fontSize:'.82rem',outline:'none',letterSpacing:'.5px',colorScheme:'dark',boxSizing:'border-box'},
  filterBtn:  {padding:'7px 14px',borderRadius:'2px',cursor:'pointer',fontSize:'.62rem',fontWeight:700,letterSpacing:'2px',transition:'all .2s',fontFamily:"'Montserrat',sans-serif"},
  tableWrap:  {borderRadius:'4px',border:'1px solid #1e1e2e',overflowX:'auto',marginBottom:'32px'},
  table:      {width:'100%',borderCollapse:'collapse',background:'#0e0e14'},
  th:         {padding:'14px 16px',textAlign:'left',fontSize:'.6rem',color:'#4a5060',letterSpacing:'3px',fontWeight:700,whiteSpace:'nowrap',background:'#0a0a10'},
  td:         {padding:'16px',fontSize:'.85rem',verticalAlign:'middle'},
  btnAdd:     {background:'linear-gradient(135deg,#9b1c31,#7a1526)',border:'none',color:'#f0f2f8',fontWeight:700,padding:'10px 22px',borderRadius:'3px',cursor:'pointer',letterSpacing:'2px',fontSize:'.72rem',fontFamily:"'Montserrat',sans-serif",boxShadow:'0 4px 16px rgba(155,28,49,0.4)'},
  btnExit:    {background:'transparent',border:'1px solid #1e1e2e',color:'#4a5060',fontWeight:600,padding:'10px 22px',borderRadius:'3px',cursor:'pointer',fontSize:'.72rem',letterSpacing:'2px',fontFamily:"'Montserrat',sans-serif"},
  btnEdit:    {background:'rgba(200,205,214,0.08)',border:'1px solid rgba(200,205,214,0.2)',color:'#c8cdd6',padding:'6px 14px',borderRadius:'2px',cursor:'pointer',fontSize:'.65rem',fontWeight:700,letterSpacing:'2px'},
  btnDel:     {background:'rgba(155,28,49,0.15)',border:'1px solid rgba(155,28,49,0.4)',color:'#f87171',padding:'6px 10px',borderRadius:'2px',cursor:'pointer',fontSize:'.75rem'},
  overlay:    {position:'fixed',inset:0,background:'rgba(5,5,8,0.92)',backdropFilter:'blur(8px)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'},
  modal:      {background:'#0e0e14',border:'1px solid #1e1e2e',borderRadius:'4px',padding:'36px',width:'100%',maxWidth:'720px',maxHeight:'90vh',overflowY:'auto',position:'relative'},
  modalTop:   {position:'absolute',top:0,left:0,right:0,height:'2px',background:'linear-gradient(90deg,transparent,#9b1c31,#c8cdd6,#9b1c31,transparent)',borderRadius:'4px 4px 0 0'},
  closeBtn:   {background:'#1e1e2e',border:'none',color:'#f0f2f8',width:'30px',height:'30px',borderRadius:'50%',cursor:'pointer',fontSize:'.85rem'},
  formGrid:   {display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'16px'},
  field:      {display:'flex',flexDirection:'column',gap:'6px'},
  lbl:        {fontSize:'.6rem',color:'#4a5060',letterSpacing:'3px',fontWeight:700,textTransform:'uppercase'},
  inp:        {background:'#13131c',border:'1px solid #1e1e2e',borderRadius:'3px',color:'#f0f2f8',padding:'11px 14px',fontSize:'.88rem',fontFamily:"'Montserrat',sans-serif",outline:'none',colorScheme:'dark',transition:'border-color .2s'},
  center:     {textAlign:'center',padding:'80px',color:'#4a5060',letterSpacing:'3px',fontSize:'.8rem'},
};

export default AdminFleet;