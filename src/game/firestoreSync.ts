import { useEffect, useRef } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useGame } from "@/game/store";

const PERSIST_KEYS = [
  "coins", "reputation", "totalSales", "storageTier",
  "inventory", "listings", "upgradeLevels",
  "discoveredDesigners", "freeUploads", "webshopUnlocked",
] as const;

type PersistShape = Pick<ReturnType<typeof useGame.getState>, typeof PERSIST_KEYS[number]>;

const pickPersist = (s: ReturnType<typeof useGame.getState>): PersistShape =>
  PERSIST_KEYS.reduce((acc, k) => {
    (acc as any)[k] = s[k];
    return acc;
  }, {} as PersistShape);

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
          // first-time user — seed remote with current local state
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

export function useFirebaseUser() {
  const ref = useRef<User | null>(null);
  const [, force] = (require("react") as typeof import("react")).useReducer((x: number) => x + 1, 0);
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      ref.current = u;
      force();
    });
  }, []);
  return ref.current;
}
