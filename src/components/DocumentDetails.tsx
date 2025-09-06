import React, {useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {environment} from "../env/Enviroment";

interface DocumentData {
    id: string;
    fileName: string;
    objectName: string;
    contentType: string;
    size: number;
    minioUrl: string;
    content: string;
    fullName: string;
    securityOrganization: string;
    affectedOrganization: string;
    severity: string;
    address: string;
}

const DocumentDetails: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const doc: DocumentData | undefined = location.state?.document;

    const [formValues, setFormValues] = useState({
        securityOrganization: doc?.securityOrganization || "",
        affectedOrganization: doc?.affectedOrganization || "",
        severity: doc?.severity || "",
        address: doc?.address || "",
        content: doc?.content || "",
    });

    const [loading, setLoading] = useState(false);

    if (!doc) {
        return (
            <div style={containerStyle}>
                <h2 style={titleStyle}>Greška</h2>
                <p>Nema podataka o dokumentu.</p>
                <button style={buttonStyle} onClick={() => navigate("/")}>
                    Nazad na početnu
                </button>
            </div>
        );
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setFormValues((prev) => ({...prev, [name]: value}));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${environment.apiHost}incidents/save`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
                body: JSON.stringify({...doc, ...formValues}),
            });

            if (res.ok) {
                await res.json(); // čita response, ali ne čuva u promenljivoj
                alert("Incident uspešno sačuvan!");
                navigate("/");
            } else {
                alert("Greška prilikom čuvanja incidenta.");
            }
        } catch (err) {
            console.error("Greška pri čuvanju:", err);
            alert("Došlo je do greške pri čuvanju incidenta.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!window.confirm("Da li ste sigurni da želite da otkažete upload?")) return;

        setLoading(true);
        try {
            const res = await fetch(`${environment.apiHost}incidents/cancel/${doc.objectName}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
            });

            if (res.ok) {
                alert("Upload je otkazan i fajl je obrisan iz Minio.");
                navigate("/");
            } else {
                alert("Greška prilikom otkazivanja upload-a.");
            }
        } catch (err) {
            console.error("Greška pri otkazivanju upload-a:", err);
            alert("Došlo je do greške pri otkazivanju upload-a.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={containerStyle}>
            <h2 style={titleStyle}>Detalji dokumenta</h2>

            <form style={formStyle}>
                <label style={labelStyle}>
                    Bezbednosna organizacija:
                    <input
                        type="text"
                        name="securityOrganization"
                        value={formValues.securityOrganization}
                        onChange={handleChange}
                        style={inputStyle}
                    />
                </label>

                <label style={labelStyle}>
                    Pogođena organizacija:
                    <input
                        type="text"
                        name="affectedOrganization"
                        value={formValues.affectedOrganization}
                        onChange={handleChange}
                        style={inputStyle}
                    />
                </label>

                <label style={labelStyle}>
                    Ozbiljnost:
                    <input
                        type="text"
                        name="severity"
                        value={formValues.severity}
                        onChange={handleChange}
                        style={inputStyle}
                    />
                </label>

                <label style={labelStyle}>
                    Adresa:
                    <input
                        type="text"
                        name="address"
                        value={formValues.address}
                        onChange={handleChange}
                        style={inputStyle}
                    />
                </label>

                <label style={labelStyle}>
                    Opis incidenta:
                    <textarea
                        name="content"
                        value={formValues.content}
                        onChange={handleChange}
                        rows={6}
                        style={textareaStyle}
                    />
                </label>

                <div style={buttonGroupStyle}>
                    <button type="button" onClick={handleSave} style={buttonStyle}>
                        Sačuvaj izmene
                    </button>
                    <button type="button" onClick={handleCancel} style={cancelButtonStyle}>
                        Otkaži upload
                    </button>
                </div>
            </form>

            {loading && (
                <div style={overlayStyle}>
                    <div style={dialogStyle}>
                        <div className="spinner" style={spinnerStyle}></div>
                        <p>Učitavanje...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const containerStyle: React.CSSProperties = {
    maxWidth: "800px",
    margin: "2rem auto",
    padding: "2rem",
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    fontFamily: "Arial, sans-serif",
};

const titleStyle: React.CSSProperties = {marginBottom: "1.5rem", color: "#333"};
const formStyle: React.CSSProperties = {display: "flex", flexDirection: "column", gap: "1.2rem"};
const labelStyle: React.CSSProperties = {display: "flex", flexDirection: "column", fontWeight: "bold", color: "#444"};
const inputStyle: React.CSSProperties = {
    marginTop: "0.4rem",
    padding: "0.6rem",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "1rem"
};
const textareaStyle: React.CSSProperties = {...inputStyle, resize: "vertical"};
const buttonStyle: React.CSSProperties = {
    marginTop: "1rem",
    padding: "0.8rem 1.2rem",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "background 0.2s"
};
const cancelButtonStyle: React.CSSProperties = {...buttonStyle, backgroundColor: "#dc3545"};
const buttonGroupStyle: React.CSSProperties = {display: "flex", gap: "1rem"};
const overlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000
};
const dialogStyle: React.CSSProperties = {
    background: "#fff",
    padding: "2rem",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
};
const spinnerStyle: React.CSSProperties = {
    margin: "0 auto 1rem auto",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #007bff",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    animation: "spin 1s linear infinite"
};

export default DocumentDetails;
