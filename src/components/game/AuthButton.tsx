import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { LogIn, LogOut, Cloud } from "lucide-react";
import { toast } from "sonner";
import { useFirebaseUser } from "@/game/firestoreSync";

export const AuthButton = () => {
  const { user, ready } = useFirebaseUser();
  if (!ready) return null;

  if (!user) {
    return (
      <button
        onClick={async () => {
          try {
            await signInWithPopup(auth, googleProvider);
            toast.success("Signed in — saving to cloud");
          } catch (e: any) {
            toast.error("Sign-in failed", { description: e?.message });
          }
        }}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-secondary border border-border tap-scale text-xs font-semibold"
        aria-label="Sign in with Google"
      >
        <LogIn className="h-3.5 w-3.5" /> Sign in
      </button>
    );
  }

  return (
    <button
      onClick={() => signOut(auth).then(() => toast("Signed out"))}
      className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-success/15 border border-success/30 tap-scale text-xs font-semibold text-success"
      title={user.displayName ?? user.email ?? "Signed in"}
    >
      <Cloud className="h-3.5 w-3.5" />
      <span className="max-w-[60px] truncate hidden sm:inline">
        {user.displayName?.split(" ")[0] ?? "Cloud"}
      </span>
      <LogOut className="h-3 w-3 opacity-60" />
    </button>
  );
};
