import React, { useState, useMemo, useEffect } from 'react';
import {
  SectionHeader, Card, Table, TrackingBadge,
  StatusBadge, Button, Modal, Input, Alert, Select
} from '../../ui';
import { shipmentAPI, hubAPI } from '../../../services/api';

const STATUSES = [
  'CREATED', 'DISPATCHED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY',
  'DELIVERED', 'DELIVERY_ATTEMPTED', 'FAILED', 'RETURNED_TO_SENDER'
];

// ── India States & Cities data ────────────────────────────────────────────────
const INDIA_STATES_CITIES = {
  'Andhra Pradesh': ['Visakhapatnam','Vijayawada','Guntur','Nellore','Kurnool','Rajahmundry','Tirupati','Kakinada','Kadapa','Anantapur','Eluru','Ongole','Vizianagaram','Chittoor','Srikakulam'],
  'Arunachal Pradesh': ['Itanagar','Naharlagun','Pasighat','Tawang','Ziro','Bomdila','Tezu','Along','Changlang','Khonsa'],
  'Assam': ['Guwahati','Silchar','Dibrugarh','Jorhat','Nagaon','Tinsukia','Tezpur','Bongaigaon','Dhubri','Diphu','North Lakhimpur','Sivasagar'],
  'Bihar': ['Patna','Gaya','Muzaffarpur','Bhagalpur','Darbhanga','Arrah','Purnia','Begusarai','Katihar','Munger','Chapra','Samastipur','Hajipur','Supaul','Sitamarhi'],
  'Chhattisgarh': ['Raipur','Bhilai','Bilaspur','Korba','Durg','Rajnandgaon','Jagdalpur','Ambikapur','Raigarh','Dhamtari'],
  'Goa': ['Panaji','Margao','Vasco da Gama','Mapusa','Ponda','Bicholim','Valpoi','Sanquelim','Cuncolim'],
  'Gujarat': ['Ahmedabad','Surat','Vadodara','Rajkot','Bhavnagar','Jamnagar','Junagadh','Gandhinagar','Anand','Nadiad','Morbi','Surendranagar','Bharuch','Mehsana','Patan','Amreli','Navsari','Valsad','Porbandar','Godhra'],
  'Haryana': ['Faridabad','Gurgaon','Panipat','Ambala','Yamunanagar','Rohtak','Hisar','Karnal','Sonipat','Panchkula','Bhiwani','Sirsa','Bahadurgarh','Rewari','Kaithal'],
  'Himachal Pradesh': ['Shimla','Manali','Dharamshala','Solan','Mandi','Kullu','Hamirpur','Una','Bilaspur','Chamba','Nahan','Palampur'],
  'Jharkhand': ['Ranchi','Jamshedpur','Dhanbad','Bokaro','Deoghar','Phusro','Hazaribagh','Giridih','Ramgarh','Medininagar','Chirkunda','Chaibasa'],
  'Karnataka': ['Bengaluru','Mysuru','Hubli','Mangaluru','Belagavi','Kalaburagi','Davanagere','Ballari','Tumakuru','Shivamogga','Vijayapura','Bidar','Hassan','Udupi','Dharwad','Raichur','Chitradurga','Mandya','Gadag','Bagalkote'],
  'Kerala': ['Thiruvananthapuram','Kochi','Kozhikode','Thrissur','Kollam','Palakkad','Alappuzha','Malappuram','Kannur','Kottayam','Kasaragod','Idukki','Wayanad','Pathanamthitta','Ernakulam'],
  'Madhya Pradesh': ['Bhopal','Indore','Jabalpur','Gwalior','Ujjain','Sagar','Dewas','Satna','Ratlam','Rewa','Murwara','Singrauli','Burhanpur','Khandwa','Chhindwara','Bhind','Vidisha','Hoshangabad','Itarsi','Sehore'],
  'Maharashtra': ['Mumbai','Pune','Nagpur','Nashik','Aurangabad','Solapur','Amravati','Kolhapur','Thane','Navi Mumbai','Pimpri-Chinchwad','Kalyan','Vasai-Virar','Sangli','Malegaon','Jalgaon','Akola','Latur','Dhule','Ahmednagar','Chandrapur','Ichalkaranji','Jalna','Ambernath','Bhiwandi','Nanded','Ulhasnagar','Ratnagiri','Satara','Osmanabad'],
  'Manipur': ['Imphal','Thoubal','Bishnupur','Churachandpur','Senapati','Ukhrul','Kakching','Moreh'],
  'Meghalaya': ['Shillong','Tura','Jowai','Nongstoin','Baghmara','Williamnagar'],
  'Mizoram': ['Aizawl','Lunglei','Champhai','Serchhip','Kolasib','Lawngtlai','Mamit','Saiha'],
  'Nagaland': ['Kohima','Dimapur','Mokokchung','Tuensang','Wokha','Zunheboto','Phek','Mon'],
  'Odisha': ['Bhubaneswar','Cuttack','Rourkela','Brahmapur','Sambalpur','Puri','Balasore','Bhadrak','Baripada','Jharsuguda','Bargarh','Balangir','Koraput','Rayagada'],
  'Punjab': ['Ludhiana','Amritsar','Jalandhar','Patiala','Bathinda','Hoshiarpur','Batala','Pathankot','Moga','Firozpur','Muktsar','Sangrur','Fazilka','Ropar','Mohali','Kapurthala'],
  'Rajasthan': ['Jaipur','Jodhpur','Kota','Bikaner','Ajmer','Udaipur','Bhilwara','Alwar','Sikar','Bharatpur','Sri Ganganagar','Pali','Barmer','Tonk','Churu','Jhalawar','Kishangarh','Sawai Madhopur','Nagaur','Hanumangarh'],
  'Sikkim': ['Gangtok','Namchi','Gyalshing','Mangan','Rangpo','Jorethang'],
  'Tamil Nadu': ['Chennai','Coimbatore','Madurai','Tiruchirappalli','Salem','Tirunelveli','Tiruppur','Vellore','Erode','Thoothukudi','Dindigul','Thanjavur','Ranipet','Sivakasi','Karur','Udhagamandalam','Hosur','Nagercoil','Kanchipuram','Kumaracoil'],
  'Telangana': ['Hyderabad','Warangal','Nizamabad','Karimnagar','Ramagundam','Khammam','Mahbubnagar','Nalgonda','Adilabad','Suryapet','Miryalaguda','Siddipet','Jagtial','Mancherial'],
  'Tripura': ['Agartala','Udaipur','Dharmanagar','Sabroom','Kailasahar','Belonia','Khowai','Ambassa'],
  'Uttar Pradesh': ['Lucknow','Kanpur','Ghaziabad','Agra','Meerut','Varanasi','Prayagraj','Bareilly','Aligarh','Moradabad','Saharanpur','Gorakhpur','Noida','Firozabad','Jhansi','Muzaffarnagar','Mathura','Budaun','Rampur','Shahjahanpur','Hapur','Etawah','Sambhal','Ayodhya','Amroha','Hardoi','Fatehpur','Raebareli','Orai','Bahraich','Bijnor'],
  'Uttarakhand': ['Dehradun','Haridwar','Roorkee','Haldwani','Rishikesh','Rudrapur','Kashipur','Pantnagar','Nainital','Mussoorie','Tehri','Pithoragarh','Almora'],
  'West Bengal': ['Kolkata','Asansol','Siliguri','Durgapur','Bardhaman','Malda','Barasat','Habra','Kharagpur','Shantipur','Dankuni','Dhulian','Ranaghat','Uluberia','Haldia','Darjeeling','Cooch Behar','Purulia','Balurghat','Midnapore'],
  'Andaman and Nicobar Islands': ['Port Blair','Diglipur','Rangat','Mayabunder','Car Nicobar'],
  'Chandigarh': ['Chandigarh'],
  'Dadra and Nagar Haveli and Daman and Diu': ['Daman','Diu','Silvassa'],
  'Delhi': ['New Delhi','Delhi','Dwarka','Rohini','Janakpuri','Pitampura','Laxmi Nagar','Shahdara','Saket','Vasant Kunj','Karol Bagh','Connaught Place','Mayur Vihar','Preet Vihar'],
  'Jammu and Kashmir': ['Srinagar','Jammu','Anantnag','Sopore','Baramulla','Kathua','Punch','Rajouri','Udhampur','Kulgam'],
  'Ladakh': ['Leh','Kargil'],
  'Lakshadweep': ['Kavaratti','Agatti','Minicoy'],
  'Puducherry': ['Puducherry','Karaikal','Mahe','Yanam'],
};

const STATE_OPTIONS = [
  { value: '', label: '— Select State —' },
  ...Object.keys(INDIA_STATES_CITIES).sort().map(s => ({ value: s, label: s }))
];

function getCityOptions(state) {
  if (!state || !INDIA_STATES_CITIES[state]) return [{ value: '', label: '— Select City —' }];
  return [
    { value: '', label: '— Select City —' },
    ...INDIA_STATES_CITIES[state].sort().map(c => ({ value: c, label: c }))
  ];
}

const EMPTY_FORM = {
  senderName: '', senderPhone: '', senderEmail: '', senderAddress: '',
  senderCity: '', senderState: '',
  receiverName: '', receiverPhone: '', receiverEmail: '', receiverAddress: '',
  receiverCity: '', receiverState: '',
  weight: '', description: '',
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

// ── Reusable styled field components ─────────────────────────────────────────
function FieldGroup({ label, required, error, touched, children }) {
  const showError = touched && error;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{
        fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
        textTransform: 'uppercase',
        color: showError ? '#dc2626' : '#64748b',
      }}>
        {label}{required && <span style={{ color: '#dc2626', marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {showError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
          <span style={{ fontSize: 13, color: '#dc2626' }}>⚠</span>
          <span style={{ fontSize: 12, color: '#dc2626', fontWeight: 500 }}>{error}</span>
        </div>
      )}
    </div>
  );
}

function StyledInput({ error, touched, ...props }) {
  const showError = touched && error;
  return (
    <input
      {...props}
      style={{
        width: '100%',
        padding: '9px 12px',
        borderRadius: 8,
        border: `1.5px solid ${showError ? '#fca5a5' : '#cbd5e1'}`,
        background: showError ? '#fff7f7' : '#fff',
        fontSize: 13,
        color: '#1e293b',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 0.15s',
        fontFamily: 'inherit',
      }}
      onFocus={e => e.target.style.borderColor = showError ? '#ef4444' : '#6366f1'}
      onBlur={e => {
        e.target.style.borderColor = showError ? '#fca5a5' : '#cbd5e1';
        props.onBlur?.(e);
      }}
    />
  );
}

function StyledDropdown({ error, touched, options = [], value, onChange, onBlur, disabled }) {
  const showError = touched && error;
  return (
    <select
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '9px 12px',
        borderRadius: 8,
        border: `1.5px solid ${showError ? '#fca5a5' : '#cbd5e1'}`,
        background: disabled ? '#f1f5f9' : showError ? '#fff7f7' : '#fff',
        fontSize: 13,
        color: value ? '#1e293b' : '#94a3b8',
        outline: 'none',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
        cursor: disabled ? 'not-allowed' : 'pointer',
        appearance: 'auto',
        transition: 'border-color 0.15s',
      }}
      onFocus={e => { if (!disabled) e.target.style.borderColor = showError ? '#ef4444' : '#6366f1'; }}
    >
      {options.map(o => (
        <option key={o.value} value={o.value} disabled={o.value === '' && false}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

// ── Validation progress bar ───────────────────────────────────────────────────
function ValidationProgress({ form, errors }) {
  const countableFields = Object.keys(EMPTY_FORM).filter(k => k !== 'description');
  const total  = countableFields.length;
  const filled = countableFields.filter(k => form[k] && form[k].toString().trim() !== '').length;
  const valid  = filled - Object.keys(errors).filter(k => k !== 'description').length;
  const pct    = Math.round((Math.max(0, valid) / total) * 100);

  const color = pct < 40 ? '#ef4444' : pct < 80 ? '#f59e0b' : '#10b981';
  const label = pct < 40 ? 'Just started' : pct < 80 ? 'Almost there' : pct === 100 ? 'Ready to submit!' : 'Looking good';

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Form completion</span>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>{label} — {pct}%</span>
      </div>
      <div style={{ height: 6, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, background: color,
          borderRadius: 99, transition: 'width 0.3s, background 0.3s',
        }} />
      </div>
    </div>
  );
}

// ── Section box wrapper ───────────────────────────────────────────────────────
function SectionBox({ title, subtitle, color, icon, children }) {
  return (
    <div style={{ borderRadius: 12, border: `1.5px solid ${color}33`, overflow: 'hidden' }}>
      <div style={{
        padding: '10px 16px',
        background: `${color}11`,
        borderBottom: `1.5px solid ${color}33`,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {title}
          </div>
          {subtitle && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{subtitle}</div>}
        </div>
      </div>
      <div style={{ padding: 16, background: '#fff', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {children}
      </div>
    </div>
  );
}

// ── Error summary panel ───────────────────────────────────────────────────────
function ErrorSummary({ errors, touched }) {
  const activeErrors = Object.entries(errors).filter(([k]) => touched[k]);
  if (activeErrors.length === 0) return null;

  const labels = {
    senderName:    'Sender name',
    senderPhone:   'Sender phone',
    senderEmail:   'Sender email',
    senderAddress: 'Pickup address',
    senderCity:    'Pickup city',
    senderState:   'Pickup state',
    receiverName:    'Receiver name',
    receiverPhone:   'Receiver phone',
    receiverEmail:   'Receiver email',
    receiverAddress: 'Delivery address',
    receiverCity:    'Delivery city',
    receiverState:   'Delivery state',
    weight: 'Package weight',
  };

  return (
    <div style={{
      background: '#fef2f2', border: '1.5px solid #fca5a5',
      borderRadius: 10, padding: '12px 16px', marginBottom: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <span style={{ fontSize: 16 }}>⚠️</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#dc2626' }}>
          {activeErrors.length} issue{activeErrors.length > 1 ? 's' : ''} need{activeErrors.length === 1 ? 's' : ''} your attention
        </span>
      </div>
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {activeErrors.map(([field, msg]) => (
          <li key={field} style={{ fontSize: 12, color: '#b91c1c', marginBottom: 2 }}>
            <strong>{labels[field] || field}:</strong> {msg}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Pagination component ──────────────────────────────────────────────────────
function Pagination({ page, totalPages, pageSize, totalItems, onPageChange, onPageSizeChange }) {
  const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem   = Math.min(page * pageSize, totalItems);

  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = new Set([1, totalPages, page, page - 1, page + 1].filter(p => p >= 1 && p <= totalPages));
    const sorted = Array.from(pages).sort((a, b) => a - b);
    const result = [];
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push('…');
      result.push(sorted[i]);
    }
    return result;
  };

  const btnBase = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    minWidth: 34, height: 34, borderRadius: 8,
    border: '1.5px solid #e2e8f0', background: '#fff',
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
    color: '#475569', transition: 'all 0.15s', padding: '0 6px',
    fontFamily: 'inherit',
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 20px', borderTop: '1px solid #e2e8f0',
      background: '#f8fafc', borderBottomLeftRadius: 12, borderBottomRightRadius: 12,
      flexWrap: 'wrap', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: 13, color: '#64748b' }}>
          {totalItems === 0
            ? 'No results'
            : <><strong style={{ color: '#1e293b' }}>{startItem}–{endItem}</strong> of <strong style={{ color: '#1e293b' }}>{totalItems}</strong> shipments</>
          }
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap' }}>Per page:</span>
          <select
            value={pageSize}
            onChange={e => onPageSizeChange(Number(e.target.value))}
            style={{
              border: '1.5px solid #e2e8f0', borderRadius: 7, padding: '4px 8px',
              fontSize: 12, fontWeight: 600, color: '#475569', background: '#fff',
              cursor: 'pointer', outline: 'none', fontFamily: 'inherit',
            }}
          >
            {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button
          onClick={() => onPageChange(page - 1)} disabled={page <= 1}
          style={{ ...btnBase, opacity: page <= 1 ? 0.4 : 1, cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
          onMouseEnter={e => { if (page > 1) { e.target.style.background='#f1f5f9'; e.target.style.borderColor='#6366f1'; e.target.style.color='#6366f1'; }}}
          onMouseLeave={e => { e.target.style.background='#fff'; e.target.style.borderColor='#e2e8f0'; e.target.style.color='#475569'; }}
        >‹</button>
        {getPages().map((p, i) =>
          p === '…'
            ? <span key={`e-${i}`} style={{ padding: '0 4px', color: '#94a3b8', fontSize: 13 }}>…</span>
            : (
              <button key={p} onClick={() => onPageChange(p)}
                style={{
                  ...btnBase,
                  background: p === page ? '#6366f1' : '#fff',
                  border: `1.5px solid ${p === page ? '#6366f1' : '#e2e8f0'}`,
                  color: p === page ? '#fff' : '#475569',
                  cursor: p === page ? 'default' : 'pointer',
                  boxShadow: p === page ? '0 2px 8px #6366f140' : 'none',
                }}
                onMouseEnter={e => { if (p !== page) { e.target.style.background='#f1f5f9'; e.target.style.borderColor='#6366f1'; e.target.style.color='#6366f1'; }}}
                onMouseLeave={e => { if (p !== page) { e.target.style.background='#fff'; e.target.style.borderColor='#e2e8f0'; e.target.style.color='#475569'; }}}
              >{p}</button>
            )
        )}
        <button
          onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}
          style={{ ...btnBase, opacity: page >= totalPages ? 0.4 : 1, cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}
          onMouseEnter={e => { if (page < totalPages) { e.target.style.background='#f1f5f9'; e.target.style.borderColor='#6366f1'; e.target.style.color='#6366f1'; }}}
          onMouseLeave={e => { e.target.style.background='#fff'; e.target.style.borderColor='#e2e8f0'; e.target.style.color='#475569'; }}
        >›</button>
      </div>
    </div>
  );
}

// ── Cascading State + City picker ─────────────────────────────────────────────
function StateCityPicker({ stateValue, cityValue, onStateChange, onCityChange, onStateBlur, onCityBlur,
  stateError, cityError, stateTouched, cityTouched, accentColor }) {

  const cityOptions = getCityOptions(stateValue);
  const cityDisabled = !stateValue;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      <FieldGroup label="State" required error={stateError} touched={stateTouched}>
        <StyledDropdown
          value={stateValue}
          options={STATE_OPTIONS}
          onChange={onStateChange}
          onBlur={onStateBlur}
          error={stateError}
          touched={stateTouched}
        />
      </FieldGroup>
      <FieldGroup
        label="City"
        required
        error={cityError}
        touched={cityTouched}
      >
        <div style={{ position: 'relative' }}>
          <StyledDropdown
            value={cityValue}
            options={cityOptions}
            onChange={onCityChange}
            onBlur={onCityBlur}
            error={cityError}
            touched={cityTouched}
            disabled={cityDisabled}
          />
          {cityDisabled && (
            <div style={{
              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              fontSize: 10, color: '#94a3b8', pointerEvents: 'none', whiteSpace: 'nowrap',
            }}>
              Pick state first
            </div>
          )}
        </div>
      </FieldGroup>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Shipments({ shipments = [], setShipments, role, onViewShipment }) {
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate]     = useState(false);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [touched, setTouched]           = useState({});
  const [formAlert, setFormAlert]       = useState(null);
  const [creating, setCreating]         = useState(false);

  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);
  const [deleteAlert, setDeleteAlert]   = useState(null);

  useEffect(() => { setPage(1); }, [search, statusFilter, pageSize]);

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => shipments
    .filter(s => {
      const q = search.toLowerCase();
      return (
        (!q ||
          (s.trackingId   || '').toLowerCase().includes(q) ||
          (s.senderName   || '').toLowerCase().includes(q) ||
          (s.receiverName || '').toLowerCase().includes(q)
        ) &&
        (!statusFilter || s.currentStatus === statusFilter)
      );
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
  [shipments, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  // ── Validation ────────────────────────────────────────────────────────────
  const errors = useMemo(() => {
    const e = {};
    const phoneRx = /^\+?[\d\s\-]{10,}$/;
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const required = [
      'senderName', 'senderPhone', 'senderEmail', 'senderAddress',
      'senderState', 'senderCity',
      'receiverName', 'receiverPhone', 'receiverEmail', 'receiverAddress',
      'receiverState', 'receiverCity',
      'weight',
    ];
    required.forEach(f => {
      if (!form[f] || !form[f].toString().trim()) e[f] = 'This field is required';
    });

    if (form.senderPhone   && !phoneRx.test(form.senderPhone))   e.senderPhone   = 'Min 10 digits, can start with +91';
    if (form.receiverPhone && !phoneRx.test(form.receiverPhone)) e.receiverPhone = 'Min 10 digits, can start with +91';
    if (form.senderEmail   && !emailRx.test(form.senderEmail))   e.senderEmail   = 'Enter a valid email like name@example.com';
    if (form.receiverEmail && !emailRx.test(form.receiverEmail)) e.receiverEmail = 'Enter a valid email like name@example.com';
    if (form.weight !== '' && parseFloat(form.weight) <= 0)      e.weight        = 'Weight must be greater than 0 kg';

    // Cross-field: same pickup and delivery location
    if (
      form.senderCity && form.senderState &&
      form.receiverCity && form.receiverState &&
      form.senderCity.trim().toLowerCase() === form.receiverCity.trim().toLowerCase() &&
      form.senderState.trim().toLowerCase() === form.receiverState.trim().toLowerCase()
    ) {
      e.receiverCity = 'Delivery location must differ from pickup location';
    }

    return e;
  }, [form]);

  const statusOptions = useMemo(() => [
    { value: '', label: 'All Statuses' },
    ...STATUSES.map(s => ({ value: s, label: s.replace(/_/g, ' ') })),
  ], []);

  const handleChange = field => e => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (formAlert) setFormAlert(null);
  };

  // When state changes, reset city
  const handleStateChange = prefix => e => {
    const state = e.target.value;
    setForm(prev => ({ ...prev, [`${prefix}State`]: state, [`${prefix}City`]: '' }));
    if (formAlert) setFormAlert(null);
  };

  const handleBlur = field => () => setTouched(prev => ({ ...prev, [field]: true }));

  const handleClose = () => {
    setShowCreate(false);
    setForm(EMPTY_FORM);
    setTouched({});
    setFormAlert(null);
  };

  const createShipment = async () => {
    setTouched(Object.fromEntries(Object.keys(EMPTY_FORM).map(k => [k, true])));
    if (Object.keys(errors).length > 0) {
      setFormAlert({ msg: `Fix ${Object.keys(errors).length} error(s) before submitting.`, type: 'danger' });
      return;
    }

    setCreating(true);
    setFormAlert(null);

    try {
      const originStr      = `${form.senderCity.trim()}, ${form.senderState.trim()}`;
      const destinationStr = `${form.receiverCity.trim()}, ${form.receiverState.trim()}`;

      const payload = {
        senderName:      form.senderName.trim(),
        senderPhone:     form.senderPhone.trim(),
        senderEmail:     form.senderEmail.trim(),
        senderAddress:   form.senderAddress.trim(),
        receiverName:    form.receiverName.trim(),
        receiverPhone:   form.receiverPhone.trim(),
        receiverEmail:   form.receiverEmail.trim(),
        receiverAddress: form.receiverAddress.trim(),
        origin:      originStr,
        destination: destinationStr,
        weight:      parseFloat(form.weight),
        description: form.description.trim() || '',
      };

      console.log('📦 Sending to backend:', JSON.stringify(payload, null, 2));

      const res     = await shipmentAPI.create(payload);
      const body    = res.data;
      const created = body?.data ?? body ?? null;

      handleClose();

      if (created && typeof created === 'object') {
        setShipments(prev => [created, ...prev]);
      } else {
        shipmentAPI.getAll()
          .then(r => setShipments(r.data?.data ?? r.data ?? []))
          .catch(() => {});
      }
    } catch (err) {
      const status = err?.response?.status;
      const body   = err?.response?.data;
      setFormAlert({
        msg: body?.errors
          ? `Validation failed: ${Object.values(body.errors).join(', ')}`
          : body?.message || `Request failed (${status ?? 'network error'}). Please try again.`,
        type: 'danger',
      });
    } finally {
      setCreating(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteAlert(null);
    try {
      await shipmentAPI.delete(deleteTarget.id);
      setShipments(prev => prev.filter(s => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setDeleteAlert({ msg: err?.response?.data?.message || 'Failed to delete shipment.', type: 'danger' });
    } finally {
      setDeleting(false);
    }
  };

  const isFormInvalid = Object.keys(errors).length > 0;

  const stats = useMemo(() => ({
    total:     shipments.length,
    active:    shipments.filter(s => !['DELIVERED','FAILED','RETURNED_TO_SENDER'].includes(s.currentStatus)).length,
    delivered: shipments.filter(s => s.currentStatus === 'DELIVERED').length,
    failed:    shipments.filter(s => ['FAILED','RETURNED_TO_SENDER'].includes(s.currentStatus)).length,
  }), [shipments]);

  return (
    <div style={{ color: '#1e293b' }}>
      <SectionHeader
        title="Shipment Management"
        subtitle="Manage logistics orders and real-time tracking"
        action={
          role === 'ADMIN' && (
            <Button variant="primary" onClick={() => setShowCreate(true)}>
              + New Shipment
            </Button>
          )
        }
      />

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 22 }}>
        {[
          { label: 'Total Shipments', value: stats.total,     color: '#6366f1', bg: '#eef2ff', icon: '📦' },
          { label: 'Active',          value: stats.active,    color: '#0284c7', bg: '#e0f2fe', icon: '🚚' },
          { label: 'Delivered',       value: stats.delivered, color: '#16a34a', bg: '#dcfce7', icon: '✅' },
          { label: 'Failed / RTS',    value: stats.failed,    color: '#dc2626', bg: '#fee2e2', icon: '❌' },
        ].map(({ label, value, color, bg, icon }) => (
          <div key={label} style={{
            background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
            padding: '16px 20px', borderLeft: `4px solid ${color}`,
            display: 'flex', alignItems: 'center', gap: 14,
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10, background: bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, flexShrink: 0,
            }}>{icon}</div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color, letterSpacing: '-1px', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div style={{
        background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden',
      }}>
        {/* Toolbar */}
        <div style={{
          padding: '14px 18px', borderBottom: '1px solid #e2e8f0',
          display: 'flex', gap: 10, background: '#f8fafc', alignItems: 'center', flexWrap: 'wrap',
        }}>
          <div style={{ position: 'relative', flex: '1 1 260px', minWidth: 200 }}>
            <span style={{
              position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
              color: '#94a3b8', fontSize: 14, pointerEvents: 'none',
            }}>🔍</span>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by tracking ID, sender or receiver…"
              style={{
                width: '100%', padding: '8px 12px 8px 34px', boxSizing: 'border-box',
                border: '1.5px solid #e2e8f0', borderRadius: 8,
                fontSize: 13, outline: 'none', background: '#fff',
                color: '#1e293b', fontFamily: 'inherit', transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
          <select
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8,
              fontSize: 13, color: statusFilter ? '#1e293b' : '#94a3b8',
              background: '#fff', cursor: 'pointer', outline: 'none',
              fontFamily: 'inherit', minWidth: 160,
            }}
          >
            {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {(search || statusFilter) && (
            <button
              onClick={() => { setSearch(''); setStatusFilter(''); }}
              style={{
                padding: '6px 12px', borderRadius: 20, border: '1.5px solid #fca5a5',
                background: '#fef2f2', color: '#dc2626', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit',
              }}
            >✕ Clear filters</button>
          )}
          <span style={{ marginLeft: 'auto', fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap', fontWeight: 600 }}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        <Table
          columns={[
            { label: 'Tracking ID', render: s => <TrackingBadge id={s.trackingId} /> },
            {
              label: 'Sender',
              render: s => (
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>{s.senderName}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{s.senderAddress}</div>
                </div>
              ),
            },
            {
              label: 'Receiver',
              render: s => (
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>{s.receiverName}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{s.receiverPhone}</div>
                </div>
              ),
            },
            {
              label: 'Route',
              render: s => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                  <span style={{ background: '#eef2ff', color: '#6366f1', padding: '3px 8px', borderRadius: 6, fontWeight: 700 }}>{s.origin}</span>
                  <span style={{ color: '#cbd5e1', fontSize: 16 }}>→</span>
                  <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '3px 8px', borderRadius: 6, fontWeight: 700 }}>{s.destination}</span>
                </div>
              ),
            },
            {
              label: 'Weight',
              render: s => (
                <span style={{
                  background: '#f8fafc', border: '1px solid #e2e8f0',
                  borderRadius: 6, padding: '3px 9px',
                  fontSize: 12, fontWeight: 700, color: '#475569', whiteSpace: 'nowrap',
                }}>
                  {s.weight != null ? `${s.weight} kg` : '—'}
                </span>
              ),
            },
            { label: 'Status', render: s => <StatusBadge status={s.currentStatus} /> },
            {
              label: 'Actions',
              render: s => (
                <div style={{ display: 'flex', gap: 6 }}>
                  <Button variant="ghost" size="sm" onClick={() => onViewShipment(s)}>Details</Button>
                  {role === 'ADMIN' && (
                    <button
                      onClick={() => { setDeleteTarget(s); setDeleteAlert(null); }}
                      style={{
                        padding: '4px 10px', borderRadius: 6, border: '1px solid #fca5a5',
                        background: '#fff7f7', color: '#dc2626', fontSize: 12,
                        cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit',
                      }}
                      onMouseEnter={e => e.target.style.background = '#fee2e2'}
                      onMouseLeave={e => e.target.style.background = '#fff7f7'}
                    >Delete</button>
                  )}
                </div>
              ),
            },
          ]}
          rows={paginated}
        />

        {paginated.length === 0 && (
          <div style={{ textAlign: 'center', padding: '56px 20px', color: '#94a3b8' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#64748b' }}>No shipments found</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>
              {search || statusFilter ? 'Try adjusting your search or clearing the filters.' : 'No shipments have been created yet.'}
            </div>
          </div>
        )}

        {filtered.length > 0 && (
          <Pagination
            page={safePage} totalPages={totalPages} pageSize={pageSize} totalItems={filtered.length}
            onPageChange={setPage} onPageSizeChange={n => { setPageSize(n); setPage(1); }}
          />
        )}
      </div>

      {/* Delete Modal */}
      <Modal
        open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        title="Delete Shipment" width={440}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <button
              onClick={confirmDelete} disabled={deleting}
              style={{
                padding: '8px 20px', borderRadius: 8, border: 'none',
                background: deleting ? '#fca5a5' : '#dc2626', color: '#fff',
                fontSize: 13, fontWeight: 700,
                cursor: deleting ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              }}
            >{deleting ? 'Deleting…' : 'Yes, Delete'}</button>
          </div>
        }
      >
        {deleteAlert && <Alert message={deleteAlert.msg} type={deleteAlert.type} />}
        <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Are you sure?</div>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>This will permanently delete shipment</div>
          {deleteTarget && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 16px', display: 'inline-block' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#dc2626' }}>{deleteTarget.trackingId}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{deleteTarget.senderName} → {deleteTarget.receiverName}</div>
            </div>
          )}
          <div style={{ fontSize: 12, color: '#ef4444', marginTop: 12, fontWeight: 500 }}>⚠ This action cannot be undone.</div>
        </div>
      </Modal>

      {/* Create Modal */}
      <Modal
        open={showCreate} onClose={handleClose}
        title="Create New Logistics Order" width={900}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <span style={{ fontSize: 12, color: isFormInvalid ? '#ef4444' : '#16a34a', fontWeight: 600 }}>
              {isFormInvalid
                ? `${Object.keys(errors).length} field(s) need attention`
                : '✓ All fields valid — ready to submit'}
            </span>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="ghost" onClick={handleClose}>Cancel</Button>
              <button
                onClick={createShipment} disabled={creating}
                style={{
                  padding: '9px 22px', borderRadius: 8, border: 'none',
                  background: creating ? '#a5b4fc' : '#6366f1',
                  color: '#fff', fontSize: 13, fontWeight: 700,
                  cursor: creating ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                }}
              >{creating ? 'Creating…' : 'Finalize & Create Order'}</button>
            </div>
          </div>
        }
      >
        <ValidationProgress form={form} errors={errors} />
        <ErrorSummary errors={errors} touched={touched} />

        {formAlert && (
          <div style={{ marginBottom: 16 }}>
            <Alert message={formAlert.msg} type={formAlert.type} />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

          {/* SENDER */}
          <SectionBox title="Sender details" color="#6366f1" subtitle="Who is sending the package">
            <FieldGroup label="Full name" required error={errors.senderName} touched={touched.senderName}>
              <StyledInput
                value={form.senderName} placeholder="e.g. Rahul Sharma"
                onChange={handleChange('senderName')} onBlur={handleBlur('senderName')}
                error={errors.senderName} touched={touched.senderName}
              />
            </FieldGroup>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <FieldGroup label="Phone" required error={errors.senderPhone} touched={touched.senderPhone}>
                <StyledInput
                  value={form.senderPhone} placeholder="+91 98765 43210"
                  onChange={handleChange('senderPhone')} onBlur={handleBlur('senderPhone')}
                  error={errors.senderPhone} touched={touched.senderPhone}
                />
              </FieldGroup>
              <FieldGroup label="Email" required error={errors.senderEmail} touched={touched.senderEmail}>
                <StyledInput
                  type="email" value={form.senderEmail} placeholder="rahul@example.com"
                  onChange={handleChange('senderEmail')} onBlur={handleBlur('senderEmail')}
                  error={errors.senderEmail} touched={touched.senderEmail}
                />
              </FieldGroup>
            </div>

            <FieldGroup label="Pickup address" required error={errors.senderAddress} touched={touched.senderAddress}>
              <StyledInput
                value={form.senderAddress} placeholder="Street, Area / Landmark"
                onChange={handleChange('senderAddress')} onBlur={handleBlur('senderAddress')}
                error={errors.senderAddress} touched={touched.senderAddress}
              />
            </FieldGroup>

            {/* Cascading State → City */}
            <StateCityPicker
              stateValue={form.senderState}
              cityValue={form.senderCity}
              onStateChange={handleStateChange('sender')}
              onCityChange={handleChange('senderCity')}
              onStateBlur={handleBlur('senderState')}
              onCityBlur={handleBlur('senderCity')}
              stateError={errors.senderState}
              cityError={errors.senderCity}
              stateTouched={touched.senderState}
              cityTouched={touched.senderCity}
              accentColor="#6366f1"
            />

            {/* Live geocode preview */}
            {form.senderAddress && form.senderCity && form.senderState && (
              <div style={{
                background: '#f0fdf4', border: '1px solid #86efac',
                borderRadius: 8, padding: '8px 12px',
                fontSize: 11, color: '#166534',
              }}>
                📍 Will geocode: <strong>{form.senderAddress.trim()}, {form.senderCity}, {form.senderState}</strong>
              </div>
            )}
          </SectionBox>

          {/* RECEIVER */}
          <SectionBox title="Receiver details" color="#0284c7" subtitle="Who is receiving the package">
            <FieldGroup label="Full name" required error={errors.receiverName} touched={touched.receiverName}>
              <StyledInput
                value={form.receiverName} placeholder="e.g. Priya Verma"
                onChange={handleChange('receiverName')} onBlur={handleBlur('receiverName')}
                error={errors.receiverName} touched={touched.receiverName}
              />
            </FieldGroup>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <FieldGroup label="Phone" required error={errors.receiverPhone} touched={touched.receiverPhone}>
                <StyledInput
                  value={form.receiverPhone} placeholder="+91 91234 56789"
                  onChange={handleChange('receiverPhone')} onBlur={handleBlur('receiverPhone')}
                  error={errors.receiverPhone} touched={touched.receiverPhone}
                />
              </FieldGroup>
              <FieldGroup label="Email" required error={errors.receiverEmail} touched={touched.receiverEmail}>
                <StyledInput
                  type="email" value={form.receiverEmail} placeholder="priya@example.com"
                  onChange={handleChange('receiverEmail')} onBlur={handleBlur('receiverEmail')}
                  error={errors.receiverEmail} touched={touched.receiverEmail}
                />
              </FieldGroup>
            </div>

            <FieldGroup label="Delivery address" required error={errors.receiverAddress} touched={touched.receiverAddress}>
              <StyledInput
                value={form.receiverAddress} placeholder="Street, Area / Landmark"
                onChange={handleChange('receiverAddress')} onBlur={handleBlur('receiverAddress')}
                error={errors.receiverAddress} touched={touched.receiverAddress}
              />
            </FieldGroup>

            {/* Cascading State → City */}
            <StateCityPicker
              stateValue={form.receiverState}
              cityValue={form.receiverCity}
              onStateChange={handleStateChange('receiver')}
              onCityChange={handleChange('receiverCity')}
              onStateBlur={handleBlur('receiverState')}
              onCityBlur={handleBlur('receiverCity')}
              stateError={errors.receiverState}
              cityError={errors.receiverCity}
              stateTouched={touched.receiverState}
              cityTouched={touched.receiverCity}
              accentColor="#0284c7"
            />

            {/* Live geocode preview */}
            {form.receiverAddress && form.receiverCity && form.receiverState && (
              <div style={{
                background: '#eff6ff', border: '1px solid #93c5fd',
                borderRadius: 8, padding: '8px 12px',
                fontSize: 11, color: '#1e40af',
              }}>
                📍 Will geocode: <strong>{form.receiverAddress.trim()}, {form.receiverCity}, {form.receiverState}</strong>
              </div>
            )}
          </SectionBox>
        </div>

        {/* PACKAGE */}
        <SectionBox title="Package specifications" icon="📦" color="#16a34a" subtitle="Weight and contents">
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16 }}>
            <FieldGroup label="Weight (kg)" required error={errors.weight} touched={touched.weight}>
              <StyledInput
                type="number" min="0.01" step="0.01"
                value={form.weight} placeholder="e.g. 2.5"
                onChange={handleChange('weight')} onBlur={handleBlur('weight')}
                error={errors.weight} touched={touched.weight}
              />
            </FieldGroup>
            <FieldGroup label="Description (optional)">
              <StyledInput
                value={form.description}
                placeholder="e.g. Fragile glass items, electronics, documents"
                onChange={handleChange('description')}
              />
            </FieldGroup>
          </div>
        </SectionBox>
      </Modal>
    </div>
  );
}