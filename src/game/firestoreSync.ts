import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useGame } from "@/game/store";

const PERSIST_KEYS = [
  "coins", "reputation", "totalSales", "storageTier",
  "inventory", "listings", "upgradeLevels",
  "discoveredDesigners", "freeUploads", "webshopUnlocked",
] as const;

type GS = ReturnType<typeof useGame.getState>;
type PersistShape = Pick<GS, typeof PERSIST_KEYS[number]>;

const pickPersist = (s: GS): PersistShape =>
  PERSIST_KEYS.reduce((acc, k) => {
    (acc as any)[k] = s[k];
    return acc;
  }, {} as PersistShape);

export function useFirebaseUser() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setReady(true);
    });
    return () => unsub();
  }, []);
  return { user, ready };
}

/**
 * Mirrors local game state to Firestore for the signed-in user.
 *  - On login: pulls remote, merges into local store.
 *  - While logged in: debounce-pushes local changes to Firestore.
 */
export function useFirestoreSync(user: User | null) {
  const lastPushed = useRef<string>("");

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "players", user.uid));
        if (cancelled) return;
        if (snap.exists()) {
          const remote = snap.data() as Partial<PersistShape>;
          useGame.getState().hydrate(remote as any);
          lastPushed.current = JSON.stringify(remote);
        } else {
          const local = pickPersist(useGame.getState());
          await setDoc(doc(db, "players", user.uid), local);
          lastPushed.current = JSON.stringify(local);
        }
      } catch (e) {
        console.warn("[firestore] hydrate failed", e);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const unsub = useGame.subscribe((s) => {
      const data = pickPersist(s);
      const json = JSON.stringify(data);
      if (json === lastPushed.current) return;
      lastPushed.current = json;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        setDoc(doc(db, "players", user.uid), data).catch((e) =>
          console.warn("[firestore] push failed", e)
        );
      }, 1500);
    });
    return () => {
      unsub();
      if (timer) clearTimeout(timer);
    };
  }, [user]);
}
