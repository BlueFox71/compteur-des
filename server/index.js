import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Chemins vers les fichiers de données
const CONFIG_FILE = join(__dirname, 'data.json');
const JETS_FILE = join(__dirname, 'jets.json');
const SEANCES_FILE = join(__dirname, 'seances.json');
const CAMPAGNES_FILE = join(__dirname, 'campagnes.json');

// Fonction pour lire les données de configuration
async function readConfig() {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { joueurs: [], typesJets: [] };
  }
}

// Fonction pour lire les jets
async function readJets() {
  try {
    const data = await fs.readFile(JETS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { jets: [] };
  }
}

// Fonction pour lire les séances
async function readSeances() {
  try {
    const data = await fs.readFile(SEANCES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { seances: [] };
  }
}

// Fonction pour écrire les données de configuration
async function writeConfig(data) {
  await fs.writeFile(CONFIG_FILE, JSON.stringify(data, null, 2));
}

// Fonction pour écrire les jets
async function writeJets(data) {
  await fs.writeFile(JETS_FILE, JSON.stringify(data, null, 2));
}

// Fonction pour écrire les séances
async function writeSeances(data) {
  await fs.writeFile(SEANCES_FILE, JSON.stringify(data, null, 2));
}

// Fonction pour lire les campagnes
async function readCampagnes() {
  try {
    const data = await fs.readFile(CAMPAGNES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { campagnes: [] };
  }
}

// Fonction pour écrire les campagnes
async function writeCampagnes(data) {
  await fs.writeFile(CAMPAGNES_FILE, JSON.stringify(data, null, 2));
}

// Route pour obtenir la configuration
app.get('/api/config', async (req, res) => {
  try {
    const data = await readConfig();
    res.json(data);
  } catch (error) {
    console.error('Erreur lors de la lecture:', error);
    res.status(500).json({ error: 'Erreur lors de la lecture de la configuration' });
  }
});

// Route pour sauvegarder la configuration
app.post('/api/config', async (req, res) => {
  try {
    const data = req.body;
    await writeConfig(data);
    res.json(data);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    res.status(500).json({ error: 'Erreur lors de la sauvegarde de la configuration' });
  }
});

// Route pour obtenir les jets
app.get('/api/jets', async (req, res) => {
  try {
    const data = await readJets();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la lecture des jets' });
  }
});

// Route pour sauvegarder un jet
app.post('/api/jets', async (req, res) => {
  try {
    const data = await readJets();
    const newJet = {
      ...req.body,
      id: Date.now().toString(),
      date: new Date().toISOString()
    };
    data.jets.push(newJet);
    await writeJets(data);
    res.json({ jet: newJet });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la sauvegarde du jet' });
  }
});

// Route pour vider les jets
app.delete('/api/jets', async (req, res) => {
  try {
    await writeJets({ jets: [] });
    res.json({ message: 'Jets supprimés avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression des jets' });
  }
});

// Route pour sauvegarder une séance
app.post('/api/seances', async (req, res) => {
  try {
    const seancesData = await readSeances();
    const newSeance = {
      ...req.body,
      id: Date.now().toString(),
      dateFin: new Date().toISOString()
    };
    seancesData.seances.push(newSeance);
    await writeSeances(seancesData);
    
    // Vider les jets après sauvegarde de la séance
    await writeJets({ jets: [] });
    
    res.json({ seance: newSeance });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la sauvegarde de la séance' });
  }
});

// Route pour récupérer toutes les séances
app.get('/api/seances', async (req, res) => {
  try {
    const data = await readSeances();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la lecture des séances' });
  }
});

// Route pour modifier une séance
app.put('/api/seances/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const seanceModifiee = req.body;
    
    const seancesData = await readSeances();
    const index = seancesData.seances.findIndex(seance => seance.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Séance non trouvée' });
    }
    
    // Garder les propriétés existantes et mettre à jour avec les nouvelles données
    seancesData.seances[index] = {
      ...seancesData.seances[index],
      ...seanceModifiee,
      id: id // S'assurer que l'ID reste le même
    };
    
    await writeSeances(seancesData);
    res.json({ seance: seancesData.seances[index] });
  } catch (error) {
    console.error('Erreur lors de la modification de la séance:', error);
    res.status(500).json({ error: 'Erreur lors de la modification de la séance' });
  }
});

// Route pour supprimer une séance
app.delete('/api/seances/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const seancesData = await readSeances();
    const index = seancesData.seances.findIndex(seance => seance.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Séance non trouvée' });
    }
    
    // Supprimer la séance
    const seanceSupprimee = seancesData.seances[index];
    seancesData.seances.splice(index, 1);
    
    await writeSeances(seancesData);
    res.json({ message: 'Séance supprimée avec succès', seance: seanceSupprimee });
  } catch (error) {
    console.error('Erreur lors de la suppression de la séance:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la séance' });
  }
});

// Route pour récupérer toutes les campagnes
app.get('/api/campagnes', async (req, res) => {
  try {
    const data = await readCampagnes();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la lecture des campagnes' });
  }
});

// Route pour sauvegarder les campagnes
app.post('/api/campagnes', async (req, res) => {
  try {
    const data = req.body;
    await writeCampagnes(data);
    res.json(data);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des campagnes:', error);
    res.status(500).json({ error: 'Erreur lors de la sauvegarde des campagnes' });
  }
});

// Route pour modifier un jet individuellement
app.put('/api/jets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await readJets();
    const index = data.jets.findIndex(jet => jet.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Jet non trouvé' });
    }
    data.jets[index] = { ...data.jets[index], ...req.body, id };
    await writeJets(data);
    res.json({ jet: data.jets[index] });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la modification du jet' });
  }
});

app.listen(PORT, () => {
  // Serveur démarré sur le port 3001
}); 