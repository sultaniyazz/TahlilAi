import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { BrandKit } from '@/shared/ui/dashboard/BrandKit';

export default function BrandKitPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0F0F11]">
      {/* Brand Kit Header */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold gradient-text-full hidden sm:inline">
                  InfoGraphic AI
                </span>
              </a>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="/"
                className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors"
              >
                Dashboard
              </a>
              <a
                href="/editor"
                className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors"
              >
                Editor
              </a>
              <div className="h-6 w-px bg-white/10" />
              <div className="flex items-center gap-3">
                <span className="text-sm text-white/70">{user?.name}</span>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-white/50 hover:text-white transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <BrandKit />
    </div>
  );
}

