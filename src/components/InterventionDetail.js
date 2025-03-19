// src/components/InterventionDetail.js
import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import html2pdf from 'html2pdf.js';
import { pdfjs } from 'react-pdf';
import { FaFilePdf, FaCamera, FaSignature, FaSave, FaTimes, FaArrowLeft } from 'react-icons/fa';
import './InterventionDetails.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const InterventionDetail = () => {
  const { token } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [intervention, setIntervention] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);
  const [signature, setSignature] = useState(null);
  const [rapportPDF, setRapportPDF] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [description, setDescription] = useState('');
  const signatureRef = useRef();

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      Underline,
    ],
    content: '', // Contenu initial vide
    onUpdate: ({ editor }) => {
      setDescription(editor.getHTML()); // Mettre à jour l'état description à chaque changement
    },
  });

  useEffect(() => {
    const fetchIntervention = async () => {
      try {
        const response = await axios.get(`https://django4d-1.onrender.com/api/interventions/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIntervention(response.data);
        setPhotos(response.data.photos || []);
        setSignature(response.data.signature || null);
        setRapportPDF(response.data.rapport_pdf || null);

        // Pré-remplir la description
        const initialDescription = response.data.description || '';
        setDescription(initialDescription);
        if (editor && initialDescription) {
          editor.commands.setContent(initialDescription);
        }
      } catch (err) {
        console.error('Error fetching intervention:', err);
        setError('Erreur lors de la récupération des détails de l’intervention');
      }
    };
    fetchIntervention();
  }, [token, id, editor]);

  const handleAddPhotos = (e) => {
    setNewPhotos([...newPhotos, ...Array.from(e.target.files)]);
  };

  const handleClearSignature = () => {
    signatureRef.current.clear();
    setSignature(null);
  };

  const generatePDF = async () => {
    const element = document.createElement('div');
    element.style.padding = '20px';
    element.style.fontFamily = "'Roboto', sans-serif";
    element.style.width = '190mm';
    element.style.minHeight = 'auto';
    element.style.boxSizing = 'border-box';
    element.style.backgroundColor = '#fff';
    element.style.color = '#333';

    element.innerHTML = `
      <div style="display: flex; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #003087;">
        <div style="width: 100px;">
          <strong style="color: #CA2A19; font-size: 24px;">SENI</strong><br />
          <span style="font-size: 12px; color: #666;">MULTI-SERVICES PROPRETÉ</span>
        </div>
        <div style="flex-grow: 1; text-align: center;">
          <h1 style="font-size: 24px; margin: 0; color: #003087;">PA DES VOILES</h1>
          <p style="font-size: 14px; margin: 0; color: #666;">99 VOIE DES TRAM<br />59118 WAMBRECHIES</p>
        </div>
      </div>
  
      <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 20px; background-color: #f9f9f9; border-radius: 5px;">
        <p style="font-size: 16px; font-weight: bold; margin: 0; color: #CA2A19;">
          ADRESSE DES TRAVAUX: ${intervention?.bon_de_commande?.adresse_intervention || 'Non définie'}
        </p>
      </div>
  
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; table-layout: fixed;">
        <tr>
          <td style="border: 1px solid #ddd; padding: 10px; font-size: 14px; width: 33%; word-wrap: break-word; background-color: #f9f9f9;">
            <strong>Date de l'intervention:</strong><br />${intervention?.date_execution || 'Non définie'}
          </td>
          <td style="border: 1px solid #ddd; padding: 10px; font-size: 14px; width: 33%; word-wrap: break-word; background-color: #f9f9f9;">
            <strong>Numéro de bon de commande:</strong><br />${intervention?.bon_de_commande?.numero || 'Non défini'}
          </td>
          <td style="border: 1px solid #ddd; padding: 10px; font-size: 14px; width: 33%; word-wrap: break-word; background-color: #f9f9f9;">
            <strong>Heure de l'intervention:</strong><br />${intervention?.heure_debut || 'Non définie'}
          </td>
        </tr>
      </table>
  
      <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 20px; background-color: #f9f9f9; border-radius: 5px;">
        <p style="font-size: 16px; font-weight: bold; margin: 0 0 10px 0; color: #CA2A19;">
          DESCRIPTIF DE L'INTERVENTION: ${intervention?.type_intervention || 'Non défini'}
        </p>
        <div style="font-size: 14px; min-height: 50px; color: #666;">${description || 'Non défini'}</div>
      </div>
  
      <div style="border: 1px solid #ddd; padding: 15px; background-color: #f9f9f9; border-radius: 5px;">
        <div style="width: 100%;">
          <p style="font-size: 16px; font-weight: bold; margin: 0 0 10px 0; color: #CA2A19;">
            NOM ET SIGNATURE DU LOCATAIRE
          </p>
          <div style="min-height: 50px;">
            ${signature ? `<img src="${signature}" style="width: 150px; height: auto;" crossorigin="anonymous" />` : 'Non disponible'}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(element);

    const images = element.getElementsByTagName('img');
    await Promise.all(
      Array.from(images).map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    );

    const pdf = await html2pdf()
      .set({
        margin: 10,
        filename: `intervention_${intervention.id}_rapport.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(element)
      .toPdf()
      .output('blob');

    document.body.removeChild(element);

    const pdfFile = new File([pdf], `intervention_${intervention.id}_rapport.pdf`, { type: 'application/pdf' });
    return pdfFile;
  };

  const handleSignatureEnd = () => {
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      const dataURL = signatureRef.current.toDataURL();
      setSignature(dataURL);
    }
  };

  const handleSaveSignature = () => {
    if (signatureRef.current.isEmpty()) {
      setError('Veuillez dessiner une signature avant de continuer.');
      return;
    }
    const dataURL = signatureRef.current.toDataURL();
    setSignature(dataURL);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const interventionFormData = new FormData();

    const existingSignature = intervention.signature;
    const signatureChanged = signature && signature !== existingSignature;

    if (signatureChanged) {
      const response = await fetch(signature);
      const blob = await response.blob();
      interventionFormData.append('signature', blob, 'signature.png');
    }

    // Toujours envoyer la description, même si elle est vide
    interventionFormData.append('description', description || '');

    try {
      // Mettre à jour l'intervention avec la description et la signature (si modifiée)
      if (signatureChanged || description !== intervention.description) {
        const response = await axios.patch(
          `https://django4d-1.onrender.com/api/interventions/${id}/`,
          interventionFormData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        console.log('Intervention mise à jour:', response.data);
      }

      // Ajouter les nouvelles photos si elles existent
      if (newPhotos.length > 0) {
        for (const photo of newPhotos) {
          const photoFormData = new FormData();
          photoFormData.append('image', photo);
          await axios.post(
            `https://django4d-1.onrender.com/api/interventions/${id}/photos/`,
            photoFormData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
              },
            }
          );
        }
      }

      // Générer et envoyer le PDF
      const generatedPDF = await generatePDF();
      const pdfFormData = new FormData();
      pdfFormData.append('rapport_pdf', generatedPDF);
      await axios.patch(
        `https://django4d-1.onrender.com/api/interventions/${id}/`,
        pdfFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setSuccess(true);
      setError(null);
      setNewPhotos([]);
      setTimeout(() => navigate('/dashboard-employe'), 2000);
    } catch (err) {
      console.error('Error updating intervention:', err.response ? err.response.data : err.message);
      setError('Erreur lors de la mise à jour : ' + JSON.stringify(err.response?.data));
      setSuccess(false);
    }
  };

  if (!intervention) return <div className="text-center mt-5">Chargement...</div>;
  if (error) return <div className="alert alert-danger mt-5">{error}</div>;

  return (
    <div className="container mt-5" style={{ fontFamily: "'Roboto', sans-serif" }}>
      <div className="d-flex align-items-center mb-4">
        <button className="btn btn-outline-secondary me-3" onClick={() => navigate('/dashboard-employe')}>
          <FaArrowLeft />
        </button>
        <h2 className="mb-0" style={{ color: '#003087', fontWeight: 'bold' }}>
          Intervention #{id}
        </h2>
      </div>
      {success && (
        <div className="alert alert-success" role="alert">
          Modifications enregistrées ! Redirection dans quelques secondes...
        </div>
      )}

      {/* Section Détails */}
      <div className="card mb-4 shadow-sm border-0">
        <div className="card-header bg-light text-dark d-flex justify-content-between align-items-center">
          <h3 className="mb-0" style={{ color: '#CA2A19' }}>
            Détails de l'intervention
          </h3>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <p><strong>Nom :</strong> {intervention?.bon_de_commande?.nom_prenom_locataire || 'Non défini'}</p>
              <p><strong>Téléphone :</strong> {intervention?.bon_de_commande?.telephone || 'Non défini'}</p>
              <p><strong>Adresse :</strong> {intervention?.bon_de_commande?.adresse_intervention || 'Non définie'}</p>
            </div>
            <div className="col-md-6">
              <p><strong>Date :</strong> {intervention?.date_execution || 'Non définie'}</p>
              <p><strong>Heure :</strong> {intervention?.heure_debut || 'Non définie'}</p>
              <p><strong>Type :</strong> {intervention?.type_intervention || 'Non défini'}</p>
            </div>
          </div>

          {/* Description du bon de commande (Commentaire) - Non modifiable */}
          <h4 className="mt-4" style={{ color: '#CA2A19' }}>Commentaire (Bon de commande)</h4>
          <div className="border p-3 rounded bg-light">
            <div
              className="text-muted"
              style={{ minHeight: '100px', overflowY: 'auto' }}
              dangerouslySetInnerHTML={{
                __html: intervention?.bon_de_commande?.commentaire || 'Aucun commentaire disponible.',
              }}
            />
          </div>

          {/* Description de l'intervention - Modifiable */}
          <h4 className="mt-4" style={{ color: '#CA2A19' }}>Description de l'intervention</h4>
          {editor && (
            <div className="border p-3 rounded bg-light">
              <div className="btn-group mb-3">
                <button
                  className="btn btn-outline-primary btn-sm me-1"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  disabled={!editor.can().chain().focus().toggleBold().run()}
                >
                  <strong>B</strong>
                </button>
                <button
                  className="btn btn-outline-primary btn-sm me-1"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  disabled={!editor.can().chain().focus().toggleItalic().run()}
                >
                  <em>I</em>
                </button>
                <button
                  className="btn btn-outline-primary btn-sm me-1"
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  disabled={!editor.can().chain().focus().toggleUnderline().run()}
                >
                  <u>U</u>
                </button>
                <button
                  className="btn btn-outline-primary btn-sm me-1"
                  onClick={() => editor.chain().focus().setTextAlign('left').run()}
                  disabled={editor.isActive('textAlign', { align: 'left' })}
                >
                  Gauche
                </button>
                <button
                  className="btn btn-outline-primary btn-sm me-1"
                  onClick={() => editor.chain().focus().setTextAlign('center').run()}
                  disabled={editor.isActive('textAlign', { align: 'center' })}
                >
                  Centre
                </button>
                <button
                  className="btn btn-outline-primary btn-sm me-1"
                  onClick={() => editor.chain().focus().setTextAlign('right').run()}
                  disabled={editor.isActive('textAlign', { align: 'right' })}
                >
                  Droite
                </button>
                <input
                  type="color"
                  onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                  value={editor.getAttributes('textStyle').color || '#000000'}
                  className="form-control form-control-color ms-2"
                  style={{ width: '40px' }}
                />
              </div>
              <EditorContent editor={editor} className="border p-3 rounded" style={{ minHeight: '150px' }} />
            </div>
          )}
        </div>
      </div>

      {/* Section Signature */}
      <div className="card mb-4 shadow-sm border-0">
        <div className="card-header bg-light text-dark">
          <h3 className="mb-0" style={{ color: '#CA2A19' }}>
            <FaSignature className="me-2" /> Signature
          </h3>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label">Signature du locataire</label>
            <div className="border rounded p-2 bg-light canvas-container">
              <SignatureCanvas
                ref={signatureRef}
                penColor="black"
                canvasProps={{
                  className: 'sigCanvas',
                }}
                onEnd={handleSignatureEnd}
              />
            </div>
            <div className="mt-3 d-flex gap-2">
              <button className="btn btn-outline-danger" onClick={handleClearSignature}>
                <FaTimes className="me-2" /> Effacer
              </button>
              <button className="btn btn-outline-primary" onClick={handleSaveSignature}>
                <FaSave className="me-2" /> Sauvegarder
              </button>
            </div>
            {signature && (
              <div className="mt-3">
                <p>Signature enregistrée :</p>
                <img
                  src={signature}
                  alt="Signature du locataire"
                  className="img-fluid border rounded p-2"
                  style={{ maxWidth: '300px' }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

            {/* Section Rapport PDF */}
            <div className="card mb-4 shadow-sm border-0">
        <div className="card-header bg-light text-dark">
          <h3 className="mb-0" style={{ color: '#CA2A19' }}>
            <FaFilePdf className="me-2" /> Rapport PDF
          </h3>
        </div>
        <div className="card-body">
          {rapportPDF ? (
            <div>
              <p>Rapport généré :</p>
              <p className="mt-3">
                <a
                  href={rapportPDF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-primary"
                >
                  <FaFilePdf className="me-2" /> Télécharger le rapport
                </a>
              </p>
            </div>
          ) : (
            <p className="text-muted">Aucun rapport généré pour le moment.</p>
          )}
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="d-flex gap-3 justify-content-end mb-5">
        <button className="btn btn-danger" onClick={handleSubmit}>
          <FaSave className="me-2" /> Valider
        </button>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/dashboard-employe')}>
          Absent
        </button>
      </div>
    </div>
  );
};

export default InterventionDetail;