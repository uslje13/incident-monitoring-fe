import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {environment} from "../env/Enviroment";

interface SearchConfig {
    label: string;
    endpoint: string;
    params: { name: string; label: string; type?: "text" | "select" }[];
}

const searchOptions: Record<string, SearchConfig> = {
    "by-name-severity": {
        label: "Po imenu i ozbiljnosti",
        endpoint: "incidents/search/by-name-severity",
        params: [
            {name: "name", label: "Ime i prezime", type: "text"},
            {name: "severity", label: "Ozbiljnost", type: "select"},
        ],
    },
    "by-organizations": {
        label: "Po organizacijama",
        endpoint: "incidents/search/by-organizations",
        params: [
            {name: "securityOrg", label: "Bezbednosna organizacija", type: "text"},
            {name: "affectedOrg", label: "Pogođena organizacija", type: "text"},
        ],
    },
    "by-content": {
        label: "Pretraga po sadržaju",
        endpoint: "incidents/search/by-content",
        params: [{name: "keyword", label: "Ključna reč", type: "text"}],
    },
    "phrase": {
        label: "Fraza u sadržaju",
        endpoint: "incidents/search/phrase",
        params: [{name: "phrase", label: "Fraza", type: "text"}],
    },
    "boolean": {
        label: "Boolean upit",
        endpoint: "incidents/search/boolean",
        params: [{name: "query", label: "Query (AND/OR/NOT)", type: "text"}],
    },
    "highlight": {
        label: "Pretraga sa highlight-om",
        endpoint: "incidents/search/highlight",
        params: [{name: "keyword", label: "Ključna reč", type: "text"}],
    },
    "knn": {
        label: "Approximate KNN",
        endpoint: "incidents/search/knn",
        params: [
            {name: "freeText", label: "Tekst", type: "text"},
            {name: "k", label: "Broj rezultata (k)", type: "text"},
            {name: "numCandidates", label: "Broj kandidata", type: "text"},
        ],
    },
    "geo": {
        label: "Geo pretraga",
        endpoint: "incidents/search/geo",
        params: [
            {name: "address", label: "Adresa", type: "text"},
            {name: "distance", label: "Distanca (npr. 10km)", type: "text"},
        ],
    },
};

const HomePage: React.FC = () => {
    const [selectedSearch, setSelectedSearch] = useState<string>("by-name-severity");
    const [formValues, setFormValues] = useState<Record<string, string>>({severity: "VISOKA"});
    const [results, setResults] = useState<any[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [showDashboard, setShowDashboard] = useState<boolean>(false);
    const navigate = useNavigate();

    const config = searchOptions[selectedSearch];

    const handleInputChange = (name: string, value: string) => {
        setFormValues((prev) => ({...prev, [name]: value}));
    };

    const handleSearch = async () => {
        const params = new URLSearchParams();
        config.params.forEach((p) => {
            params.append(p.name, formValues[p.name] || "");
        });

        const url =
            selectedSearch === "boolean"
                ? `${environment.apiHost}${config.endpoint}/${formValues["query"] || ""}`
                : `${environment.apiHost}${config.endpoint}?${params.toString()}`;

        try {
            const res = await fetch(url, {
                headers: {Authorization: `Bearer ${localStorage.getItem("authToken")}`},
            });
            const data = await res.json();
            setResults(data);
        } catch (err) {
            console.error("Greška u pretrazi:", err);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Molimo izaberite fajl za upload.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setLoading(true);

            const res = await fetch(`${environment.apiHost}incidents/preview`, {
                method: "POST",
                headers: {Authorization: `Bearer ${localStorage.getItem("authToken")}`},
                body: formData,
            });

            if (res.ok) {
                const responseData = await res.json();
                navigate("/document-details", {state: {document: responseData}});
                setFile(null);
            } else {
                alert("Greška prilikom slanja fajla na preview.");
            }
        } catch (err) {
            console.error("Greška prilikom slanja fajla:", err);
            alert("Došlo je do greške pri otpremanju fajla.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={containerStyle}>
            <h2>Pretraga incidenata</h2>

            <select
                value={selectedSearch}
                onChange={(e) => {
                    setSelectedSearch(e.target.value);
                    setFormValues(e.target.value === "by-name-severity" ? {severity: "VISOKA"} : {});
                    setResults([]);
                }}
                style={selectStyle}
            >
                {Object.entries(searchOptions).map(([key, cfg]) => (
                    <option key={key} value={key}>
                        {cfg.label}
                    </option>
                ))}
            </select>

            <div style={formStyle}>
                {config.params.map((param) =>
                    param.type === "select" ? (
                        <select
                            key={param.name}
                            value={formValues[param.name] || "VISOKA"}
                            onChange={(e) => handleInputChange(param.name, e.target.value)}
                            style={inputStyle}
                        >
                            <option value="VISOKA">VISOKA</option>
                            <option value="SREDNJA">SREDNJA</option>
                            <option value="NISKA">NISKA</option>
                        </select>
                    ) : (
                        <input
                            key={param.name}
                            type="text"
                            placeholder={param.label}
                            value={formValues[param.name] || ""}
                            onChange={(e) => handleInputChange(param.name, e.target.value)}
                            style={inputStyle}
                        />
                    )
                )}
                <button onClick={handleSearch} style={buttonStyle}>
                    Pretraži
                </button>
            </div>

            <h3>Upload fajla za preview</h3>
            <div style={formStyle}>
                <input type="file" onChange={handleFileChange} style={inputStyle}/>
                <button onClick={handleUpload} style={buttonStyle}>
                    Upload Preview
                </button>
            </div>

            <div style={resultsGridStyle}>
                {results.length === 0 ? (
                    <p>Nema rezultata</p>
                ) : (
                    results.map((r, i) => (
                        <div key={i} style={cardStyle}>
                            <h3 style={cardHeaderStyle}>{r.fullName}</h3>
                            <p><strong>Bezbednosna organizacija:</strong> {r.securityOrganization}</p>
                            <p><strong>Pogođena organizacija:</strong> {r.affectedOrganization}</p>
                            <p><strong>Ozbiljnost:</strong> {r.severity}</p>
                            <p><strong>Adresa:</strong> {r.address}</p>
                            <p style={contentStyle}>
                                <strong>Opis incidenta:</strong>{" "}
                                {r.content.length > 200 ? r.content.substring(0, 200) + "..." : r.content}
                            </p>
                            <a
                                href={`${environment.apiHost}files/direct-download/${r.objectName}`}
                                target="_blank"
                                style={linkStyle}
                            >
                                Preuzmi PDF
                            </a>
                        </div>
                    ))
                )}
            </div>

            <div style={{margin: "2rem 0"}}>
                <button
                    style={{...buttonStyle, marginBottom: "1rem"}}
                    onClick={() => setShowDashboard((prev) => !prev)}
                >
                    {showDashboard ? "Sakrij Kibana Dashboard" : "Prikaži Kibana Dashboard"}
                </button>
                {showDashboard && (
                    <div style={{border: "1px solid #ccc", borderRadius: "8px", padding: "0.5rem"}}>
                        <iframe
                            src="http://localhost:5601/app/dashboards#/view/8f334859-ec98-40da-bcf9-bdc4338e4804?embed=true&_g=(refreshInterval%3A(pause%3A!t%2Cvalue%3A60000)%2Ctime%3A(from%3Anow-90d%2Fd%2Cto%3Anow))"
                            height="800"
                            width="100%"
                            style={{borderRadius: "8px"}}
                            title="Kibana Dashboard"
                        ></iframe>
                    </div>
                )}
            </div>

            {loading && (
                <div style={overlayStyle}>
                    <div style={dialogStyle}>
                        <div className="spinner" style={spinnerStyle}></div>
                        <p>Uploading...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const containerStyle: React.CSSProperties = {padding: "2rem", fontFamily: "Arial, sans-serif"};
const selectStyle: React.CSSProperties = {margin: "1rem 0", padding: "0.5rem", minWidth: "200px"};
const formStyle: React.CSSProperties = {display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap"};
const inputStyle: React.CSSProperties = {padding: "0.5rem", flex: 1, minWidth: "150px"};
const buttonStyle: React.CSSProperties = {padding: "0.5rem 1rem", cursor: "pointer"};
const resultsGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "1rem"
};
const cardStyle: React.CSSProperties = {
    background: "#fff",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    transition: "transform 0.2s, box-shadow 0.2s"
};
const cardHeaderStyle: React.CSSProperties = {margin: "0 0 0.5rem 0", fontSize: "1.25rem", color: "#333"};
const contentStyle: React.CSSProperties = {marginTop: "0.5rem", lineHeight: 1.5, color: "#444"};
const linkStyle: React.CSSProperties = {
    display: "inline-block",
    marginTop: "0.75rem",
    padding: "0.5rem 1rem",
    backgroundColor: "#007bff",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "6px",
    transition: "background-color 0.2s"
};
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

export default HomePage;
