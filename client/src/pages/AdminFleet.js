import React, { useEffect, useState, useMemo } from 'react';
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

const Badge = ({ status }) => {
  const s = ST[status] || ST.inactive;
  return (
    <span style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}`,
      borderRadius:'2px', padding:'3px 8px', fontSize:'.58rem', fontWeight:700, letterSpacing:'2px' }}>
      {s.label}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────
const AdminFleet = () => {
  const navigate   = useNavigate();
  const token      = useAdminAuth();
  const headers    = useMemo(() => ({ Authorization:`Bearer ${token}` }), [token]);

  const [vehicles,    setVehicles]    = useState([]);
  const [locations,   setLocations]   = useState([]);
  const [loading,     setLoading]     = useState(true);

  // View state: 'models' | 'units'
  const [view,        setView]        = useState('models');
  const [activeModel, setActiveModel] = useState(null); // { make, model, year }

  // Modal
  const [showModal,   setShowModal]   = useState(false);
  const [editMode,    setEditMode]    = useState(false);
  const [form,        setForm]        = useState(EMPTY);
  const [saving,      setSaving]      = useState(false);
  const [confirmDel,  setConfirmDel]  = useState(null);

  // Search
  const [search,      setSearch]      = useState('');

  // ── Load data ──────────────────────────────────────────────
  const load = async () => {
    setLoading(true);
    try {
      const [vRes, lRes] = await Promise.all([
        axios.get(`${API}/api/admin/vehicles`,  { headers }),
        axios.get(`${API}/api/admin/locations`, { headers }),
      ]);
      setVehicles(vRes.data);
      setLocations(lRes.data);
    } catch(err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('adminToken'); navigate('/admin/login');
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { if (token) load(); }, [token]);

  // ── Group vehicles by make+model+year ──────────────────────
  const modelGroups = useMemo(() => {
    const groups = {};
    vehicles.forEach(v => {
      const key = `${v.make}||${v.model}||${v.year}`;
      if (!groups[key]) groups[key] = {
        make: v.make, model: v.model, year: v.year,
        category: v.category, dailyRate: v.dailyRate,
        imageUrl: v.imageUrl, units: [],
      };
      groups[key].units.push(v);
    });
    return Object.values(groups);
  }, [vehicles]);

  // ── Units for current active model ────────────────────────
  const activeUnits = useMemo(() => {
    if (!activeModel) return [];
    return vehicles.filter(v =>
      v.make === activeModel.make &&
      v.model === activeModel.model &&
      v.year === activeModel.year
    );
  }, [vehicles, activeModel]);

  // ── Stats per model ────────────────────────────────────────
  const modelStats = (units) => {
    const st = { available:0, reserved:0, rented:0, maintenance:0, inactive:0 };
    units.forEach(u => { const s = u.computedStatus||u.status; if(st[s]!==undefined) st[s]++; });
    return st;
  };

  // ── Modal helpers ──────────────────────────────────────────
  const openAdd = (prefill = {}) => {
    setForm({ ...EMPTY, ...prefill });
    setEditMode(false);
    setShowModal(true);
  };

  const openEdit = (v) => {
    setForm({
      make:v.make, model:v.model, year:v.year, category:v.category,
      transmission:v.transmission, fuelType:v.fuelType, seats:v.seats,
      color:v.color||'', plateNumber:v.plateNumber, mileage:v.mileage,
      dailyRate:v.dailyRate, locationId:v.locationId||'',
      imageUrl:v.imageUrl||'', status:v.status, _id:v.id,
    });
    setEditMode(true);
    setShowModal(true);
  };

  const F = (k, val) => setForm(f => ({ ...f, [k]: val }));

  const handleSave = async () => {
    if (!form.make || !form.model || !form.plateNumber || !form.dailyRate)
      return alert('Please fill all required fields.');
    setSaving(true);
    try {
      if (editMode) await axios.put(`${API}/api/admin/vehicles/${form._id}`, form, { headers });
      else          await axios.post(`${API}/api/admin/vehicles`, form, { headers });
      setShowModal(false);
      await load();
      // Keep unit view open after save
    } catch(err) { alert(err.response?.data?.error || 'Failed to save.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/api/admin/vehicles/${id}`, { headers });
      setConfirmDel(null);
      await load();
      // If no more units for this model, go back to models view
      const remaining = vehicles.filter(v => v.id !== id &&
        v.make === activeModel?.make && v.model === activeModel?.model);
      if (remaining.length === 0) setView('models');
    } catch(err) { alert(err.response?.data?.error || 'Cannot delete.'); }
  };

  // ── Filtered model groups ──────────────────────────────────
  const filteredGroups = modelGroups.filter(g =>
    `${g.make} ${g.model}`.toLowerCase().includes(search.toLowerCase())
  );

  // ── Global fleet stats ─────────────────────────────────────
  const totalStats = {
    total:       vehicles.length,
    available:   vehicles.filter(v => (v.computedStatus||v.status) === 'available').length,
    rented:      vehicles.filter(v => (v.computedStatus||v.status) === 'rented').length,
    maintenance: vehicles.filter(v => (v.computedStatus||v.status) === 'maintenance').length,
  };

  // ══════════════════════════════════════════════════════════
  return (
    <div style={S.wrapper}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Montserrat:wght@300;400;500;600;700;800&display=swap');
        tr:hover td { background: rgba(155,28,49,0.05) !important; }
        input::placeholder, textarea::placeholder { color: #3a3a50; }
        select option { background: #0e0e14; color: #f0f2f8; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* ── HEADER ── */}
      <div style={S.header}>
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          {view === 'units' && (
            <button style={S.backBtn} onClick={() => { setView('models'); setActiveModel(null); }}>
              ← MODELS
            </button>
          )}
          <div style={S.logoBox}>R</div>
          <div>
            <h1 style={S.headerTitle}>
              {view === 'models' ? 'FLEET MANAGEMENT' : `${activeModel?.make} ${activeModel?.model} · UNITS`}
            </h1>
            <p style={S.headerSub}>
              {view === 'models' ? `${modelGroups.length} models · ${vehicles.length} total units`
                : `${activeUnits.length} unit${activeUnits.length !== 1 ? 's' : ''} registered`}
            </p>
          </div>
        </div>
        <div style={{ display:'flex', gap:'10px' }}>
          <button style={S.btnAdd} onClick={() =>
            openAdd(view === 'units' && activeModel
              ? { make: activeModel.make, model: activeModel.model, year: activeModel.year }
              : {})
          }>
            + {view === 'units' ? `ADD ${activeModel?.model?.toUpperCase()} UNIT` : 'ADD VEHICLE'}
          </button>
          <button style={S.btnExit} onClick={() => { localStorage.removeItem('adminToken'); navigate('/catalog'); }}>
            EXIT
          </button>
        </div>
      </div>

      <div style={{ padding:'0 32px' }}>

        {/* ── STATS ── */}
        <div style={S.statsRow}>
          {[
            { l:'TOTAL UNITS',  v:totalStats.total,       c:'#c8cdd6' },
            { l:'AVAILABLE',    v:totalStats.available,    c:'#4ade80' },
            { l:'RENTED',       v:totalStats.rented,       c:'#f87171' },
            { l:'MAINTENANCE',  v:totalStats.maintenance,  c:'#f59e0b' },
          ].map(s => (
            <div key={s.l} style={S.statCard}>
              <span style={{ color:s.c, fontSize:'2.2rem', fontWeight:800, fontFamily:"'Cormorant Garamond',serif" }}>{s.v}</span>
              <span style={{ color:'#4a5060', fontSize:'.6rem', letterSpacing:'3px', fontWeight:700 }}>{s.l}</span>
            </div>
          ))}
        </div>

        {/* ── SEARCH (models view only) ── */}
        {view === 'models' && (
          <div style={{ marginBottom:'20px' }}>
            <div style={S.searchWrap}>
              <span style={S.searchIcon}>⌕</span>
              <input placeholder="Search make or model..." value={search}
                onChange={e => setSearch(e.target.value)} style={S.searchInput}/>
            </div>
          </div>
        )}

        {loading ? (
          <div style={S.center}>Loading fleet data...</div>
        ) : view === 'models' ? (

          // ══════════════════════════════════════════════════
          // VIEW 1: MODEL CARDS GRID
          // ══════════════════════════════════════════════════
          <div style={S.grid}>
            {filteredGroups.map(g => {
              const stats = modelStats(g.units);
              const img   = g.imageUrl || `https://placehold.co/400x240/0e0e14/4a5060?text=${g.make}`;
              return (
                <div key={`${g.make}-${g.model}-${g.year}`} style={S.modelCard}
                  onClick={() => { setActiveModel(g); setView('units'); }}>

                  {/* Image */}
                  <div style={{ position:'relative', height:'160px', overflow:'hidden' }}>
                    <img src={img} alt={g.model}
                      style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .4s' }}
                      onError={e => e.target.src=`https://placehold.co/400x240/0e0e14/4a5060?text=${g.make}`}
                      onMouseEnter={e => e.target.style.transform='scale(1.05)'}
                      onMouseLeave={e => e.target.style.transform='scale(1)'}
                    />
                    <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(5,5,8,0.9) 0%, transparent 60%)' }}/>
                    <div style={{ position:'absolute', bottom:'12px', left:'14px' }}>
                      <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.3rem', fontWeight:700, color:'#f0f2f8', letterSpacing:'1px' }}>
                        {g.make} {g.model}
                      </div>
                      <div style={{ color:'#9b1c31', fontSize:'.6rem', letterSpacing:'3px', fontWeight:700 }}>{g.year}</div>
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ padding:'14px 16px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
                      <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.1rem', color:'#c8cdd6', fontWeight:600 }}>
                        ${Number(g.dailyRate).toFixed(0)}<span style={{ fontSize:'.65rem', color:'#4a5060', fontWeight:400 }}>/day</span>
                      </span>
                      <span style={{ background:'rgba(155,28,49,0.15)', border:'1px solid rgba(155,28,49,0.3)', color:'#c8cdd6', borderRadius:'2px', padding:'3px 10px', fontSize:'.6rem', letterSpacing:'2px', fontWeight:700 }}>
                        {g.units.length} UNIT{g.units.length !== 1 ? 'S' : ''}
                      </span>
                    </div>

                    {/* Mini status bar */}
                    <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                      {stats.available   > 0 && <span style={miniStat('#4ade80')}>{stats.available} avail.</span>}
                      {stats.reserved    > 0 && <span style={miniStat('#fbbf24')}>{stats.reserved} reserved</span>}
                      {stats.rented      > 0 && <span style={miniStat('#f87171')}>{stats.rented} rented</span>}
                      {stats.maintenance > 0 && <span style={miniStat('#f59e0b')}>{stats.maintenance} maint.</span>}
                      {stats.inactive    > 0 && <span style={miniStat('#6b7280')}>{stats.inactive} inactive</span>}
                    </div>
                  </div>

                  {/* Hover arrow */}
                  <div style={S.cardArrow}>VIEW UNITS →</div>
                </div>
              );
            })}

            {filteredGroups.length === 0 && (
              <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'60px', color:'#4a5060', letterSpacing:'3px', fontSize:'.8rem' }}>
                NO MODELS FOUND
              </div>
            )}
          </div>

        ) : (

          // ══════════════════════════════════════════════════
          // VIEW 2: UNITS TABLE for active model
          // ══════════════════════════════════════════════════
          <div style={{ animation:'fadeUp .3s ease' }}>
            {/* Model summary card */}
            <div style={S.modelSummary}>
              <img
                src={activeModel?.imageUrl || `https://placehold.co/120x70/0e0e14/4a5060?text=${activeModel?.make}`}
                alt={activeModel?.model}
                style={{ width:'120px', height:'70px', objectFit:'cover', borderRadius:'4px', border:'1px solid #1e1e2e' }}
                onError={e => e.target.src=`https://placehold.co/120x70/0e0e14/4a5060?text=${activeModel?.make}`}
              />
              <div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.5rem', color:'#f0f2f8', fontWeight:700, letterSpacing:'2px' }}>
                  {activeModel?.make} {activeModel?.model}
                </div>
                <div style={{ color:'#4a5060', fontSize:'.65rem', letterSpacing:'3px', marginTop:'4px' }}>
                  {activeModel?.year} · {activeModel?.category} · ${Number(activeModel?.dailyRate||0).toFixed(0)}/day
                </div>
              </div>
              <div style={{ marginLeft:'auto', display:'flex', gap:'8px' }}>
                {Object.entries(modelStats(activeUnits)).map(([st, count]) =>
                  count > 0 && st !== 'inactive' ? (
                    <div key={st} style={{ textAlign:'center' }}>
                      <div style={{ color: ST[st]?.color || '#c8cdd6', fontSize:'1.4rem', fontWeight:800, fontFamily:"'Cormorant Garamond',serif" }}>{count}</div>
                      <div style={{ color:'#4a5060', fontSize:'.55rem', letterSpacing:'2px', fontWeight:700 }}>{st.toUpperCase()}</div>
                    </div>
                  ) : null
                )}
              </div>
            </div>

            {/* Units table */}
            <div style={S.tableWrap}>
              <table style={S.table}>
                <thead>
                  <tr style={{ borderBottom:'1px solid #9b1c31' }}>
                    {['UNIT #','PLATE','COLOR','MILEAGE','LOCATION','STATUS',''].map((h,i) => (
                      <th key={i} style={S.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeUnits.map((v, i) => {
                    const st = v.computedStatus || v.status;
                    return (
                      <tr key={v.id} style={{ borderBottom:'1px solid #1e1e2e', transition:'background .15s' }}>
                        <td style={{ ...S.td, color:'#9b1c31', fontFamily:"'Cormorant Garamond',serif", fontSize:'1.1rem', fontWeight:700 }}>
                          #{String(i+1).padStart(2,'0')}
                        </td>
                        <td style={{ ...S.td, fontFamily:'monospace', color:'#c8cdd6', letterSpacing:'2px', fontSize:'.85rem' }}>
                          {v.plateNumber}
                        </td>
                        <td style={{ ...S.td, color:'#8a909e', fontSize:'.82rem', textTransform:'capitalize' }}>
                          {v.color || '—'}
                        </td>
                        <td style={{ ...S.td, color:'#6a7080', fontSize:'.82rem' }}>
                          {Number(v.mileage).toLocaleString()} mi
                        </td>
                        <td style={{ ...S.td, color:'#6a7080', fontSize:'.78rem' }}>
                          {v.locationName || '—'}
                        </td>
                        <td style={S.td}><Badge status={st}/></td>
                        <td style={S.td}>
                          <div style={{ display:'flex', gap:'6px' }}>
                            <button style={S.btnEdit} onClick={() => openEdit(v)}>EDIT</button>
                            <button style={S.btnDel}  onClick={() => setConfirmDel(v)}>✕</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {activeUnits.length === 0 && (
                    <tr><td colSpan={7} style={{ ...S.td, textAlign:'center', color:'#4a5060', padding:'60px', letterSpacing:'3px', fontSize:'.8rem' }}>
                      NO UNITS REGISTERED
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── ADD / EDIT MODAL ── */}
      {showModal && (
        <div style={S.overlay} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={S.modal}>
            <div style={S.modalTop}/>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'28px' }}>
              <h2 style={{ color:'#f0f2f8', fontFamily:"'Cormorant Garamond',serif", fontSize:'1.8rem', letterSpacing:'3px' }}>
                {editMode ? 'EDIT UNIT' : view === 'units' ? `NEW ${form.model?.toUpperCase()} UNIT` : 'ADD VEHICLE'}
              </h2>
              <button style={S.closeBtn} onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div style={S.formGrid}>
              {[
                ['MAKE *',          'make',        'text',   'Toyota'],
                ['MODEL *',         'model',       'text',   'Camry'],
                ['YEAR *',          'year',        'number', null],
                ['DAILY RATE ($) *','dailyRate',   'number', '99.99'],
                ['PLATE NUMBER *',  'plateNumber', 'text',   'ABC-1234'],
                ['COLOR',           'color',       'text',   'Midnight Black'],
                ['SEATS',           'seats',       'number', null],
                ['MILEAGE',         'mileage',     'number', null],
              ].map(([lbl, key, type, ph]) => (
                <div key={key} style={S.field}>
                  <label style={S.lbl}>{lbl}</label>
                  <input style={S.inp} type={type} placeholder={ph||''} value={form[key]} onChange={e => F(key, e.target.value)}/>
                </div>
              ))}

              <div style={S.field}>
                <label style={S.lbl}>CATEGORY</label>
                <select style={S.inp} value={form.category} onChange={e => F('category', e.target.value)}>
                  {['sedan','SUV','economy','luxury'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={S.field}>
                <label style={S.lbl}>TRANSMISSION</label>
                <select style={S.inp} value={form.transmission} onChange={e => F('transmission', e.target.value)}>
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
              <div style={S.field}>
                <label style={S.lbl}>FUEL TYPE</label>
                <select style={S.inp} value={form.fuelType} onChange={e => F('fuelType', e.target.value)}>
                  {['gasoline','diesel','electric','hybrid'].map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div style={S.field}>
                <label style={S.lbl}>LOCATION</label>
                <select style={S.inp} value={form.locationId} onChange={e => F('locationId', e.target.value)}>
                  <option value="">— Select —</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name} — {l.city}</option>)}
                </select>
              </div>

              {editMode && (
                <div style={S.field}>
                  <label style={S.lbl}>STATUS (OVERRIDE)</label>
                  <select style={S.inp} value={form.status} onChange={e => F('status', e.target.value)}>
                    {['available','maintenance','inactive'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}

              <div style={{ ...S.field, gridColumn:'1 / -1' }}>
                <label style={S.lbl}>IMAGE URL</label>
                <input style={S.inp} placeholder="https://..." value={form.imageUrl} onChange={e => F('imageUrl', e.target.value)}/>
                {form.imageUrl && (
                  <img src={form.imageUrl} alt="preview"
                    style={{ marginTop:'10px', width:'100%', height:'130px', objectFit:'cover', borderRadius:'4px', border:'1px solid #1e1e2e' }}
                    onError={e => e.target.style.display='none'}/>
                )}
              </div>
            </div>

            <div style={{ display:'flex', gap:'10px', marginTop:'24px' }}>
              <button style={{ ...S.btnAdd, flex:1, padding:'14px', opacity: saving ? .6 : 1 }} onClick={handleSave} disabled={saving}>
                {saving ? 'SAVING...' : editMode ? 'SAVE CHANGES' : 'ADD UNIT'}
              </button>
              <button style={{ ...S.btnExit, padding:'14px 24px' }} onClick={() => setShowModal(false)}>CANCEL</button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      {confirmDel && (
        <div style={S.overlay}>
          <div style={{ ...S.modal, maxWidth:'400px', textAlign:'center' }}>
            <div style={S.modalTop}/>
            <div style={{ fontSize:'2rem', marginBottom:'12px', color:'#f87171' }}>⚠</div>
            <h3 style={{ color:'#f0f2f8', fontFamily:"'Cormorant Garamond',serif", fontSize:'1.5rem', letterSpacing:'2px', marginBottom:'8px' }}>
              REMOVE UNIT
            </h3>
            <p style={{ color:'#6a7080', fontSize:'.82rem', letterSpacing:'1px', marginBottom:'24px', lineHeight:1.6 }}>
              Unit <strong style={{ color:'#c8cdd6' }}>{confirmDel.plateNumber}</strong>
              <br/>{confirmDel.make} {confirmDel.model} · {confirmDel.color || 'No color'}
              <br/>will be permanently removed.
            </p>
            <div style={{ display:'flex', gap:'10px' }}>
              <button style={{ ...S.btnDel, flex:1, padding:'12px', borderRadius:'3px', fontSize:'.75rem', letterSpacing:'2px' }}
                onClick={() => handleDelete(confirmDel.id)}>DELETE</button>
              <button style={{ ...S.btnEdit, flex:1, padding:'12px', borderRadius:'3px', fontSize:'.75rem', letterSpacing:'2px' }}
                onClick={() => setConfirmDel(null)}>CANCEL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Mini status dot ────────────────────────────────────────────
const miniStat = (color) => ({
  color, fontSize:'.6rem', fontWeight:700, letterSpacing:'1px',
  background:`${color}18`, border:`1px solid ${color}44`,
  borderRadius:'2px', padding:'2px 7px',
});

// ── Styles ─────────────────────────────────────────────────────
const S = {
  wrapper:      { background:'#050508', minHeight:'100vh', fontFamily:"'Montserrat',sans-serif", color:'#f0f2f8' },
  header:       { background:'#0e0e14', borderBottom:'1px solid #9b1c31', padding:'20px 32px', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:100, boxShadow:'0 2px 20px rgba(155,28,49,0.15)' },
  logoBox:      { width:'40px', height:'40px', borderRadius:'6px', background:'linear-gradient(135deg,#9b1c31,#5c0f20)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Cormorant Garamond',serif", fontSize:'1.4rem', fontWeight:700, color:'#f0f2f8', boxShadow:'0 0 20px rgba(155,28,49,0.4)' },
  headerTitle:  { fontFamily:"'Cormorant Garamond',serif", fontSize:'1.5rem', letterSpacing:'4px', margin:0, textTransform:'uppercase' },
  headerSub:    { color:'#4a5060', fontSize:'.62rem', letterSpacing:'3px', margin:'3px 0 0', textTransform:'uppercase' },
  backBtn:      { background:'transparent', border:'1px solid #1e1e2e', color:'#8a909e', padding:'8px 16px', borderRadius:'3px', cursor:'pointer', fontSize:'.65rem', fontWeight:700, letterSpacing:'2px', fontFamily:"'Montserrat',sans-serif", transition:'all .2s' },
  statsRow:     { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', padding:'24px 0' },
  statCard:     { background:'#0e0e14', border:'1px solid #1e1e2e', borderRadius:'4px', padding:'24px', display:'flex', flexDirection:'column', alignItems:'center', gap:'6px' },
  searchWrap:   { position:'relative', maxWidth:'400px' },
  searchIcon:   { position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', color:'#4a5060', fontSize:'1.1rem' },
  searchInput:  { width:'100%', background:'#0e0e14', border:'1px solid #1e1e2e', borderRadius:'3px', color:'#f0f2f8', padding:'10px 14px 10px 38px', fontSize:'.82rem', outline:'none', colorScheme:'dark', boxSizing:'border-box' },
  // Model cards grid
  grid:         { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'16px', paddingBottom:'32px' },
  modelCard:    { background:'#0e0e14', border:'1px solid #1e1e2e', borderRadius:'4px', overflow:'hidden', cursor:'pointer', transition:'border-color .25s, box-shadow .25s', position:'relative' },
  cardArrow:    { position:'absolute', top:'12px', right:'12px', background:'rgba(5,5,8,0.7)', color:'#9b1c31', fontSize:'.58rem', fontWeight:700, letterSpacing:'2px', padding:'4px 10px', borderRadius:'2px', border:'1px solid rgba(155,28,49,0.3)' },
  // Model summary
  modelSummary: { background:'#0e0e14', border:'1px solid #1e1e2e', borderRadius:'4px', padding:'20px 24px', display:'flex', alignItems:'center', gap:'20px', marginBottom:'16px' },
  // Table
  tableWrap:    { borderRadius:'4px', border:'1px solid #1e1e2e', overflowX:'auto', marginBottom:'32px' },
  table:        { width:'100%', borderCollapse:'collapse', background:'#0e0e14' },
  th:           { padding:'14px 16px', textAlign:'left', fontSize:'.6rem', color:'#4a5060', letterSpacing:'3px', fontWeight:700, whiteSpace:'nowrap', background:'#0a0a10' },
  td:           { padding:'16px', fontSize:'.85rem', verticalAlign:'middle' },
  // Buttons
  btnAdd:       { background:'linear-gradient(135deg,#9b1c31,#7a1526)', border:'none', color:'#f0f2f8', fontWeight:700, padding:'10px 22px', borderRadius:'3px', cursor:'pointer', letterSpacing:'2px', fontSize:'.72rem', fontFamily:"'Montserrat',sans-serif", boxShadow:'0 4px 16px rgba(155,28,49,0.4)' },
  btnExit:      { background:'transparent', border:'1px solid #1e1e2e', color:'#4a5060', fontWeight:600, padding:'10px 22px', borderRadius:'3px', cursor:'pointer', fontSize:'.72rem', letterSpacing:'2px', fontFamily:"'Montserrat',sans-serif" },
  btnEdit:      { background:'rgba(200,205,214,0.08)', border:'1px solid rgba(200,205,214,0.2)', color:'#c8cdd6', padding:'6px 14px', borderRadius:'2px', cursor:'pointer', fontSize:'.65rem', fontWeight:700, letterSpacing:'2px' },
  btnDel:       { background:'rgba(155,28,49,0.15)', border:'1px solid rgba(155,28,49,0.4)', color:'#f87171', padding:'6px 10px', borderRadius:'2px', cursor:'pointer', fontSize:'.75rem' },
  // Modal
  overlay:      { position:'fixed', inset:0, background:'rgba(5,5,8,0.92)', backdropFilter:'blur(8px)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' },
  modal:        { background:'#0e0e14', border:'1px solid #1e1e2e', borderRadius:'4px', padding:'36px', width:'100%', maxWidth:'720px', maxHeight:'90vh', overflowY:'auto', position:'relative' },
  modalTop:     { position:'absolute', top:0, left:0, right:0, height:'2px', background:'linear-gradient(90deg,transparent,#9b1c31,#c8cdd6,#9b1c31,transparent)', borderRadius:'4px 4px 0 0' },
  closeBtn:     { background:'#1e1e2e', border:'none', color:'#f0f2f8', width:'30px', height:'30px', borderRadius:'50%', cursor:'pointer', fontSize:'.85rem' },
  formGrid:     { display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'16px' },
  field:        { display:'flex', flexDirection:'column', gap:'6px' },
  lbl:          { fontSize:'.6rem', color:'#4a5060', letterSpacing:'3px', fontWeight:700, textTransform:'uppercase' },
  inp:          { background:'#13131c', border:'1px solid #1e1e2e', borderRadius:'3px', color:'#f0f2f8', padding:'11px 14px', fontSize:'.88rem', fontFamily:"'Montserrat',sans-serif", outline:'none', colorScheme:'dark', transition:'border-color .2s' },
  center:       { textAlign:'center', padding:'80px', color:'#4a5060', letterSpacing:'3px', fontSize:'.8rem' },
};

export default AdminFleet;