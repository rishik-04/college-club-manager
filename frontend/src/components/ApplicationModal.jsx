import React, { useState } from 'react';
import { 
  X, 
  Send, 
  User, 
  Mail, 
  Phone, 
  MessageSquare, 
  GraduationCap, 
  QrCode, 
  Check, 
  Shirt, 
  ArrowRight, 
  ArrowLeft,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TSHIRT_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

export default function ApplicationModal({ club, isOpen, onClose, onShowToast }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1); // Step 1: Info, Step 2: Statement & T-Shirt, Step 3: Payment Scanner

  // Form Fields
  const [name, setName] = useState(user?.name || '');
  const [rollNo, setRollNo] = useState('2101A0501');
  const [branch, setBranch] = useState(user?.branch || 'Computer Science & Engineering');
  const [mobileNo, setMobileNo] = useState('+91 98765 43210');
  const [whatsappNo, setWhatsappNo] = useState('+91 98765 43210');
  const [collegeEmail, setCollegeEmail] = useState(user?.email || 'student@college.edu');
  const [personalEmail, setPersonalEmail] = useState('alex.rivera.dev@gmail.com');

  const [whyJoin, setWhyJoin] = useState('');
  const [tshirtSize, setTshirtSize] = useState('L');
  const [paymentUtr, setPaymentUtr] = useState('');

  const [loading, setLoading] = useState(false);

  if (!isOpen || !club) return null;

  const handleNext = (e) => {
    e.preventDefault();
    if (step < 3) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      onShowToast('Please sign in to submit an application', 'error');
      return;
    }
    if (!paymentUtr.trim()) {
      onShowToast('Please enter your payment Transaction UTR reference number', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.applications.apply(club.id, {
        name,
        roll_no: rollNo,
        branch,
        mobile_no: mobileNo,
        whatsapp_no: whatsappNo,
        college_email: collegeEmail,
        personal_email: personalEmail,
        why_join: whyJoin,
        tshirt_size: tshirtSize,
        payment_utr: paymentUtr
      });
      onShowToast('Application & Payment submitted successfully! Track progress in Profile.');
      onClose();
    } catch (err) {
      onShowToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex justify-center items-center p-4 animate-in fade-in">
      <div 
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 relative animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Banner */}
        <div className="p-6 bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <img
              src={club.logo_url}
              alt=""
              className="w-12 h-12 rounded-xl object-cover border-2 border-white/20 shadow-md shrink-0 bg-white"
            />
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-300">
                Unified Recruitment & Membership Portal
              </span>
              <h3 className="text-xl font-extrabold leading-tight">
                Apply to {club.name}
              </h3>
            </div>
          </div>

          {/* Wizard Step Indicators */}
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/10 text-xs font-bold">
            <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-sky-300' : 'text-slate-400'}`}>
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
              Personal Info
            </div>
            <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-sky-300' : 'text-slate-400'}`}>
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
              Statement & T-Shirt
            </div>
            <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-sky-300' : 'text-slate-400'}`}>
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">3</span>
              Payment Scanner
            </div>
          </div>
        </div>

        {/* Wizard Form */}
        <form onSubmit={step === 3 ? handleSubmit : handleNext} className="p-6 space-y-4 text-xs sm:text-sm">
          {/* STEP 1: Personal & Academic Credentials */}
          {step === 1 && (
            <div className="space-y-3.5">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                <User className="w-4 h-4 text-sky-600" />
                Step 1: Student Contact & Academic Details
              </h4>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-sky-500/20"
                    placeholder="Alex Rivera"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Roll Number *</label>
                  <input
                    type="text"
                    required
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-sky-500/20"
                    placeholder="2101A0501"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Academic Branch *</label>
                <input
                  type="text"
                  required
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-sky-500/20"
                  placeholder="Computer Science & Engineering"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={mobileNo}
                    onChange={(e) => setMobileNo(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-sky-500/20"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Number *</label>
                  <input
                    type="tel"
                    required
                    value={whatsappNo}
                    onChange={(e) => setWhatsappNo(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-sky-500/20"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">College Email *</label>
                  <input
                    type="email"
                    required
                    value={collegeEmail}
                    onChange={(e) => setCollegeEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-sky-500/20"
                    placeholder="student@college.edu"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Personal Email *</label>
                  <input
                    type="email"
                    required
                    value={personalEmail}
                    onChange={(e) => setPersonalEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-sky-500/20"
                    placeholder="alex@gmail.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Why Joining & T-Shirt Size */}
          {step === 2 && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                <Shirt className="w-4 h-4 text-sky-600" />
                Step 2: Club Statement & Official Apparel Size
              </h4>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Why are you joining {club.name}? *
                </label>
                <textarea
                  required
                  rows={4}
                  value={whyJoin}
                  onChange={(e) => setWhyJoin(e.target.value)}
                  placeholder="Describe your goals, passion, and what skills you hope to build..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-sky-500/20 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Select Official Club T-Shirt Size *
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {TSHIRT_SIZES.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setTshirtSize(sz)}
                      className={`py-3 rounded-2xl text-xs font-black border transition ${
                        tshirtSize === sz
                          ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-600/20 scale-105'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  T-shirts will be distributed during orientation week.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: Payment Scanner (UPI QR Code) */}
          {step === 3 && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                Step 3: Registration Fee & Payment Scanner
              </h4>

              {/* Payment Box */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                {/* Simulated UPI QR Code */}
                <div className="w-36 h-36 bg-white p-2 rounded-2xl border-2 border-emerald-500 shadow-md shrink-0 flex flex-col items-center justify-center">
                  <svg className="w-28 h-28 text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                    <rect x="0" y="0" width="30" height="30" rx="4" />
                    <rect x="5" y="5" width="20" height="20" fill="white" rx="2" />
                    <rect x="10" y="10" width="10" height="10" />

                    <rect x="70" y="0" width="30" height="30" rx="4" />
                    <rect x="75" y="5" width="20" height="20" fill="white" rx="2" />
                    <rect x="80" y="10" width="10" height="10" />

                    <rect x="0" y="70" width="30" height="30" rx="4" />
                    <rect x="5" y="75" width="20" height="20" fill="white" rx="2" />
                    <rect x="10" y="80" width="10" height="10" />

                    <rect x="40" y="10" width="10" height="10" />
                    <rect x="50" y="30" width="15" height="15" />
                    <rect x="35" y="55" width="15" height="15" />
                    <rect x="70" y="70" width="15" height="15" />
                  </svg>
                  <span className="text-[9px] font-bold text-emerald-700 uppercase">SCAN TO PAY</span>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-200 text-emerald-900">
                    UPI PAYMENT GATEWAY
                  </span>
                  <h5 className="font-extrabold text-slate-900 text-sm">
                    Registration Dues: ₹150 / $5
                  </h5>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Scan using Google Pay, PhonePe, Paytm, or BHIM UPI.
                  </p>
                  <p className="font-mono text-emerald-800 font-bold text-[11px] pt-1">
                    UPI ID: collegeclubs@upi
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enter Payment Transaction UTR / Ref Number *
                </label>
                <input
                  type="text"
                  required
                  value={paymentUtr}
                  onChange={(e) => setPaymentUtr(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  placeholder="e.g. UPI/329482019482 or 12-digit Ref No"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Copy the 12-digit UTR reference ID from your GPay/PhonePe receipt screen.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <div></div>
            )}

            {step < 3 ? (
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold flex items-center gap-1 shadow-md shadow-sky-600/20"
              >
                Next Step
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-lg shadow-emerald-600/25 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {loading ? 'Submitting...' : 'SUBMIT APPLICATION'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
