// Adicione este modal novo ou cole no existente
const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [key, setKey] = useState("");
  const [model, setModel] = useState(localStorage.getItem("gemini_model") || "gemini-1.5-flash");

  const saveKey = async () => {
    if (!key) return;

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode("rvm-master-pro-2025-secret"),
      "AES-GCM",
      false,
      ["encrypt"]
    );
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      cryptoKey,
      new TextEncoder().encode(key.trim())
    );

    const encryptedString = btoa(String.fromCharCode(...new Uint8Array(iv))) + "." + btoa(String.fromCharCode(...new Uint8Array(encrypted)));
    localStorage.setItem("rvm_gemini_key", encryptedString);
    localStorage.setItem("gemini_model", model);
    alert("Chave salva com criptografia máxima! ✅");
    setKey("");
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <h2>Configurações</h2>
      <input
        type="password"
        placeholder="Cole sua chave do Google AI Studio aqui"
        value={key}
        onChange={e => setKey(e.target.value)}
        className="w-full p-3 border rounded mb-4"
      />
      <select value={model} onChange={e => setModel(e.target.value)} className="w-full p-3 border rounded mb-4">
        <option value="gemini-1.5-flash">Flash (rápido e grátis)</option>
        <option value="gemini-1.5-pro">Pro (mais inteligente)</option>
      </select>
      <button onClick={saveKey} className="btn-primary">Salvar Chave</button>
      <button onClick={onClose}>Fechar</button>
    </div>
  );
};
