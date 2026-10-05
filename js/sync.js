// Cloud sync sign-in: header button + modal. Signing in on each device makes them share data
// through Supabase (see the cloud sync section in storage.js).

function SyncButton() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(cloudSyncStatus);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!supabaseClient) return;
    supabaseClient.auth.getSession().then(({ data }) => setUser(data?.session?.user || null));
    const { data } = supabaseClient.auth.onAuthStateChange((event, session) => setUser(session?.user || null));
    const unsubscribeStatus = onCloudSyncStatus(setStatus);
    return () => {
      data?.subscription?.unsubscribe();
      unsubscribeStatus();
    };
  }, []);

  let label = "☁️ Sync devices";
  let color = undefined;
  if (user && status.state === "error") {
    label = "⚠️ Sync error";
    color = "#B4472E";
  } else if (user) {
    label = "☁️ Synced";
    color = "#4E8B6B";
  }

  return (
    <>
      <button
        className="btnSecondary"
        onClick={() => setOpen(true)}
        style={color ? { color, borderColor: color } : undefined}
        title={user ? `Signed in as ${user.email}` : "Sign in to keep your data in sync across devices"}
      >
        {label}
      </button>
      {open && <SyncModal user={user} status={status} onClose={() => setOpen(false)} />}
    </>
  );
}

function SyncModal({ user, status, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  async function run(action) {
    setBusy(true);
    setMessage(null);
    try {
      await action();
    } catch (e) {
      setMessage({ type: "error", text: e.message || String(e) });
    } finally {
      setBusy(false);
    }
  }

  const signIn = () =>
    run(async () => {
      const { error } = await supabaseClient.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      onClose();
    });

  const signUp = () =>
    run(async () => {
      const { data, error } = await supabaseClient.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: window.location.origin + window.location.pathname },
      });
      if (error) throw error;
      if (data.session) {
        onClose();
      } else {
        setMessage({ type: "success", text: "Account created. Check your email for a confirmation link, then sign in here." });
      }
    });

  const signOut = () =>
    run(async () => {
      const { error } = await supabaseClient.auth.signOut();
      if (error) throw error;
      onClose();
    });

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalBox" onClick={(e) => e.stopPropagation()}>
        <ModalHeader title="Sync across devices" onClose={onClose} />
        {!supabaseClient ? (
          <p style={{ fontSize: 13, color: "#B4472E" }}>Supabase isn't available, so sync can't be used right now.</p>
        ) : user ? (
          <>
            <p style={{ fontSize: 13, color: "#A7ADBB", lineHeight: 1.5 }}>
              Signed in as <strong style={{ color: "#EDEAE1" }}>{user.email}</strong>. Everything you change here is saved to
              your account, and any device signed into the same account shows the same data.
            </p>
            {status.state === "error" && (
              <p style={{ fontSize: 12, color: "#B4472E", lineHeight: 1.5 }}>
                Last sync failed: {status.message}. Your changes are still saved on this device and will upload on the next
                successful sync.
              </p>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <button className="btnSecondary" onClick={signOut} disabled={busy}>
                Sign out
              </button>
            </div>
          </>
        ) : (
          <>
            <p style={{ fontSize: 13, color: "#A7ADBB", lineHeight: 1.5, marginTop: 0 }}>
              Sign in with the same account on each device to share your cards, sales, targets and everything else. The first
              time a device signs in, its data is combined with what's already in your account, so nothing is lost.
            </p>
            <Field label="Email">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </Field>
            <Field label="Password">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && email && password) signIn();
                }}
              />
            </Field>
            {message && (
              <p style={{ fontSize: 12, color: message.type === "error" ? "#B4472E" : "#4E8B6B", lineHeight: 1.5 }}>
                {message.text}
              </p>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
              <button className="btnSecondary" onClick={signUp} disabled={busy || !email || password.length < 6}>
                Create account
              </button>
              <button className="btnPrimary" onClick={signIn} disabled={busy || !email || !password}>
                {busy ? "Working…" : "Sign in"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
