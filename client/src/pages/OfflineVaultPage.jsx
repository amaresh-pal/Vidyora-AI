import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getOfflineLessons,
  getOfflineQuizzes,
  deleteOfflineLesson,
  getPendingSyncAttempts,
  saveLessonOffline,
  saveOfflineQuiz,
  seedOfflineStarterPack
} from '../services/offlineStorage';
import { lessonsAPI, quizzesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  HardDriveDownload,
  Wifi,
  WifiOff,
  Trash2,
  BookOpen,
  RefreshCw,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  DownloadCloud,
  Languages,
  Award,
  BookMarked,
  Loader2
} from 'lucide-react';

export default function OfflineVaultPage() {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const { user, isOnline, triggerOfflineSync } = useAuth();

  const [offlineLessons, setOfflineLessons] = useState([]);
  const [offlineQuizzes, setOfflineQuizzes] = useState([]);
  const [pendingSync, setPendingSync] = useState([]);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [downloadingPack, setDownloadingPack] = useState(false);
  const [loadingVault, setLoadingVault] = useState(true);
  const [vaultLanguage, setVaultLanguage] = useState(lang === 'or' ? 'or' : 'en');
  const [selectedPackClass, setSelectedPackClass] = useState(user?.classLevel || 'Class 8');

  useEffect(() => {
    setVaultLanguage(lang === 'or' ? 'or' : 'en');
  }, [lang]);

  useEffect(() => {
    loadVault();
  }, []);

  const loadVault = async () => {
    try {
      setLoadingVault(true);
      const [lessons, quizzes, syncQueue] = await Promise.all([
        getOfflineLessons(),
        getOfflineQuizzes(),
        getPendingSyncAttempts()
      ]);
      setOfflineLessons(lessons || []);
      setOfflineQuizzes(quizzes || []);
      setPendingSync(syncQueue || []);
    } catch (err) {
      console.error('Failed to load offline vault:', err);
    } finally {
      setLoadingVault(false);
    }
  };

  const handleDownloadStarterPack = async () => {
    try {
      setDownloadingPack(true);
      if (isOnline) {
        try {
          const [lesRes, qzRes] = await Promise.all([
            lessonsAPI.getLessons({ classLevel: selectedPackClass }),
            quizzesAPI.getQuizzes({ classLevel: selectedPackClass }),
          ]);
          const lessons = lesRes.data.lessons || [];
          const quizzes = qzRes.data.quizzes || [];

          for (const l of lessons.slice(0, 5)) {
            await saveLessonOffline(l);
          }
          for (const q of quizzes.slice(0, 5)) {
            await saveOfflineQuiz(q);
          }
        } catch (netErr) {
          console.warn('Network starter pack fetch failed, falling back to local bilingual seed:', netErr);
          await seedOfflineStarterPack();
        }
      } else {
        await seedOfflineStarterPack();
      }
      await loadVault();
    } catch (err) {
      console.error('Failed to download starter pack:', err);
    } finally {
      setDownloadingPack(false);
    }
  };

  const handleDeleteLesson = async (id) => {
    await deleteOfflineLesson(id);
    setOfflineLessons((prev) => prev.filter((l) => l._id !== id));
  };

  const handleManualSync = async () => {
    setSyncing(true);
    await triggerOfflineSync();
    await loadVault();
    setSyncing(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Back Button */}
      <div>
        <button
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate('/dashboard');
            }
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-brand-navy hover:bg-slate-50 transition-all shadow-2xs group cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 text-brand-teal group-hover:-translate-x-0.5 transition-transform" />
          <span>{lang === 'or' ? '← ପଛକୁ ଫେରନ୍ତୁ (Back)' : '← Back to Dashboard'}</span>
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy flex items-center gap-2.5">
            <HardDriveDownload className="w-7 h-7 text-cyan-600" />
            <span>{t('nav.offlineLessons')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {lang === 'or'
              ? 'ଇଣ୍ଟରନେଟ୍ ବିନା ଅଫଲାଇନ୍ ମୋଡ୍‌ରେ ପଢ଼ିବା ପାଇଁ ଓଡ଼ିଆ ଓ ଇଂରାଜୀ ଉଭୟ ଭାଷାରେ ବିଷୟବସ୍ତୁ ଉପଲବ୍ଧ ।'
              : 'Study anytime without internet. All offline content is available in both Odia and English.'}
          </p>
        </div>

        {/* Hackathon Offline Simulator Toggle */}
        <div className="p-2 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="text-left">
            <div className="text-xs font-extrabold text-brand-navy">Simulate Village Mode</div>
            <div className="text-[10px] text-slate-400">Zero Internet Test</div>
          </div>
          <button
            onClick={() => setIsSimulatedOffline(!isSimulatedOffline)}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              isSimulatedOffline
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isSimulatedOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
            <span>{isSimulatedOffline ? 'Simulating Offline' : 'Online Normal'}</span>
          </button>
        </div>
      </div>

      {isSimulatedOffline && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 text-amber-900 text-xs font-semibold flex items-center gap-2">
          <WifiOff className="w-5 h-5 text-amber-600 shrink-0 animate-pulse" />
          <span>
            Simulated Offline Mode is ACTIVE! Lessons & Quizzes are being served directly from browser IndexedDB storage with full Odia & English bilingual support.
          </span>
        </div>
      )}

      {/* Sync Queue Banner if pending */}
      {pendingSync.length > 0 && (
        <div className="p-5 rounded-3xl bg-cyan-50 border border-cyan-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-cyan-950 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-600" />
              <span>{pendingSync.length} Offline Quiz Attempt(s) Queued</span>
            </h4>
            <p className="text-xs text-cyan-800">
              Completed while offline. Ready to sync with your student profile and parent report.
            </p>
          </div>

          <button
            onClick={handleManualSync}
            disabled={syncing || !isOnline}
            className="px-5 py-2.5 rounded-xl bg-cyan-700 text-white text-xs font-extrabold hover:bg-cyan-800 disabled:opacity-50 flex items-center gap-2 shadow-2xs shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Sync to Cloud Now'}</span>
          </button>
        </div>
      )}

      {/* Single Button Language Switcher */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-brand-teal" />
          <span className="text-xs font-bold text-brand-navy">
            {lang === 'or' ? 'ଅଫଲାଇନ୍ ବିଷୟବସ୍ତୁ ଭାଷା:' : 'Offline Content Language:'}
          </span>
        </div>

        {/* ONLY ONE BUTTON FOR ODIA AND ENGLISH LANGUAGE SWITCH */}
        <button
          onClick={() => setVaultLanguage((prev) => (prev === 'or' ? 'en' : 'or'))}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-brand-navy text-xs font-extrabold flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
          title="Switch language between Odia and English"
        >
          <Languages className="w-4 h-4 text-brand-teal" />
          <span>{vaultLanguage === 'or' ? 'Switch to English 🇬🇧' : 'ଓଡ଼ିଆରେ ଦେଖନ୍ତୁ (Odia) 🇮🇳'}</span>
        </button>
      </div>

      {/* 1-Click Starter Offline Pack Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-900 via-slate-900 to-brand-navy text-white shadow-sm border border-brand-teal/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-teal/20 text-brand-teal text-[11px] font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Bilingual Offline Pack (ଓଡ଼ିଆ + English)</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold">
            {lang === 'or' ? 'ଗୋଟିଏ କ୍ଲିକ୍‌ରେ ୫ଟି ବିଷୟର ଅଫଲାଇନ୍ ପାଠ ଓ କୁଇଜ୍ (ଓଡ଼ିଆ + ଇଂରାଜୀ)' : '1-Click Offline Starter Pack (5 Subjects + Chapter Quizzes)'}
          </h3>
          <p className="text-xs text-slate-300">
            {lang === 'or' ? 'ଗ୍ରାମାଞ୍ଚଳ ଓ ୨G ଇଣ୍ଟରନେଟ୍ ପାଇଁ ଉଦ୍ଦିଷ୍ଟ: ବିଜ୍ଞାନ, ଗଣିତ, ସାମାଜିକ ବିଜ୍ଞାନ ଓ କମ୍ପ୍ୟୁଟର ବିଷୟଗୁଡ଼ିକ ଉଭୟ ଓଡ଼ିଆ ଏବଂ ଇଂରାଜୀ ମାଧ୍ୟମରେ ସାଇତା ହୋଇଛି ।' : 'Preloaded with authentic Odia & English textbooks: Science, Mathematics, Social Studies, and Computer Science ready for zero-internet study.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <select
            value={selectedPackClass}
            onChange={(e) => setSelectedPackClass(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold border border-slate-700 outline-none"
          >
            {['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'].map((cls) => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>

          <button
            onClick={handleDownloadStarterPack}
            disabled={downloadingPack}
            className="px-4 py-2 rounded-xl bg-brand-teal text-brand-navy text-xs font-extrabold hover:bg-brand-tealLight disabled:opacity-50 flex items-center gap-2 shadow-2xs cursor-pointer transition-all hover:scale-105"
          >
            {downloadingPack ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Downloading...</span>
              </>
            ) : (
              <>
                <DownloadCloud className="w-3.5 h-3.5" />
                <span>Download {selectedPackClass} Pack</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Downloaded Lessons Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-brand-teal" />
            <span>Downloaded Lessons ({offlineLessons.length})</span>
          </h2>
          <span className="text-xs font-semibold text-slate-400">
            Stored in browser IndexedDB
          </span>
        </div>

        {loadingVault ? (
          <div className="glass-panel p-10 rounded-3xl text-center space-y-3">
            <Loader2 className="w-8 h-8 text-brand-teal animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-500">Accessing offline storage...</p>
          </div>
        ) : offlineLessons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {offlineLessons.map((l) => (
              <div
                key={l._id}
                className="glass-card p-5 rounded-3xl flex flex-col justify-between gap-4 border border-slate-200 hover:border-brand-teal/40 transition-all bg-white shadow-2xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-teal/15 text-brand-teal uppercase">
                      {l.subject?.nameOdia ? `${l.subject.nameOdia} • ${l.subject.name}` : (l.subject?.name || 'Science')}
                    </span>
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ଓଡ଼ିଆ + English
                    </span>
                  </div>

                  {/* Title according to vaultLanguage */}
                  {vaultLanguage === 'or' ? (
                    <h3 className="text-lg sm:text-xl font-black text-brand-navy leading-snug">
                      {l.titleOdia || l.title}
                    </h3>
                  ) : vaultLanguage === 'en' ? (
                    <h3 className="text-lg sm:text-xl font-black text-brand-navy leading-snug">
                      {l.title}
                    </h3>
                  ) : (
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-brand-navy leading-snug">
                        {l.titleOdia || l.title}
                      </h3>
                      <p className="text-sm font-semibold text-slate-500 mt-1">
                        {l.title}
                      </p>
                    </div>
                  )}

                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    Saved Offline • Class: {l.classLevel || 'Class 8'} • Duration: {l.durationMinutes || 15} Mins
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Link
                      to={`/lessons/${l._id}?lang=${vaultLanguage}`}
                      className="px-4 py-2 rounded-xl bg-brand-navy text-white text-xs sm:text-sm font-extrabold hover:bg-brand-navyLight inline-flex items-center gap-2 transition-all shadow-2xs"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>{vaultLanguage === 'or' ? 'ପାଠ ପଢ଼ନ୍ତୁ (Read Lesson)' : 'Read Lesson'}</span>
                    </Link>
                  </div>

                  <button
                    onClick={() => handleDeleteLesson(l._id)}
                    className="text-slate-300 hover:text-rose-500 p-1.5 transition-colors shrink-0"
                    title="Remove from vault"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel p-10 rounded-3xl text-center space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-brand-navy">No Lessons Downloaded Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click the "Download Starter Pack" above to instantly load 5 foundational chapters and quizzes in Odia & English into this browser vault!
            </p>
          </div>
        )}
      </div>

      {/* Downloaded Quizzes Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-orange" />
            <span>Offline Chapter Quizzes ({offlineQuizzes.length})</span>
          </h2>
          <span className="text-xs font-semibold text-slate-400">
            Self-evaluates offline in Odia & English
          </span>
        </div>

        {offlineQuizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {offlineQuizzes.map((q) => (
              <div
                key={q._id}
                className="glass-card p-5 rounded-3xl flex flex-col justify-between gap-3 border border-slate-200 hover:border-brand-orange/40 transition-all bg-white shadow-2xs"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 uppercase">
                      {q.subject?.nameOdia ? `${q.subject.nameOdia} • ${q.subject.name}` : (q.subject?.name || 'Quiz')}
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                      {q.questions?.length || 3} Questions (Bilingual)
                    </span>
                  </div>

                  {vaultLanguage === 'or' ? (
                    <h3 className="text-sm font-extrabold text-brand-navy">
                      {q.titleOdia || q.title}
                    </h3>
                  ) : vaultLanguage === 'en' ? (
                    <h3 className="text-sm font-extrabold text-brand-navy">
                      {q.title}
                    </h3>
                  ) : (
                    <div>
                      <h3 className="text-sm font-extrabold text-brand-navy">
                        {q.titleOdia || q.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {q.title}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Instant scoring without internet
                  </span>
                  <Link
                    to={`/quizzes/${q._id}`}
                    className="px-3 py-1.5 rounded-xl bg-brand-orange text-white text-xs font-bold hover:bg-orange-600 inline-flex items-center gap-1 transition-all shadow-2xs"
                  >
                    <span>Take Quiz Offline</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

    </div>
  );
}
