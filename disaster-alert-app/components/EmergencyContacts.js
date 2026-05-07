cat > components/EmergencyContacts.js << 'EOF'
"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function EmergencyContacts() {
  const [contacts, setContacts] = useState([]);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  useEffect(() => {
    const savedContacts = localStorage.getItem("emergencyContacts");
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    }
  }, []);

  const saveContacts = (updatedContacts) => {
    setContacts(updatedContacts);
    localStorage.setItem("emergencyContacts", JSON.stringify(updatedContacts));
    toast.success("Contacts saved successfully!");
  };

  const addContact = (e) => {
    e.preventDefault();
    
    if (!newName.trim() || !newPhone.trim()) {
      toast.error("Please enter both name and phone number");
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(newPhone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    const newContact = {
      id: Date.now().toString(),
      name: newName,
      phone: newPhone,
    };

    saveContacts([...contacts, newContact]);
    setNewName("");
    setNewPhone("");
  };

  const deleteContact = (id) => {
    const updatedContacts = contacts.filter(contact => contact.id !== id);
    saveContacts(updatedContacts);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">📞 Emergency Contacts</h3>
      
      <form onSubmit={addContact} className="mb-4 space-y-2">
        <input
          type="text"
          placeholder="Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="tel"
          placeholder="Phone Number (10 digits)"
          value={newPhone}
          onChange={(e) => setNewPhone(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
        >
          + Add Contact
        </button>
      </form>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {contacts.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No contacts added yet. Add family or friends to receive SOS alerts.
          </p>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-semibold text-gray-800">{contact.name}</p>
                <p className="text-sm text-gray-600">{contact.phone}</p>
              </div>
              <button
                onClick={() => deleteContact(contact.id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
      
      <p className="text-xs text-gray-500 mt-3 text-center">
        These contacts will receive SMS with your location when you press SOS button
      </p>
    </div>
  );
}
EOF