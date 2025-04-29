"use client";
import { useState, useEffect, FormEvent } from "react";
import axios from "axios";
import {
  FaBuilding,
  FaBriefcase,
  FaChartLine,
  FaMoneyBillWave,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes,
  FaSpinner,
} from "react-icons/fa";
import { toast, Toaster } from "react-hot-toast";

interface Job {
  company: string;
  title: string;
  year_experience: number;
}

export default function Home() {
  const [formData, setFormData] = useState<Job>({
    company: "",
    title: "",
    year_experience: 0
  });
  const [salary, setSalary] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [userSalary, setUserSalary] = useState<number>(0);
  const [status, setStatus] = useState<string>("Antonony");
  const [loading, setLoading] = useState({
    submit: false,
    feedback: false,
    initial: true,
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    // Vérification initiale de l'API_URL avec timeout de sécurité
    const timer = setTimeout(() => {
      setLoading((l) => ({ ...l, initial: false }));
    }, 3000);

    if (!API_URL) {
      toast.error("Erreur de configuration du serveur", {
        icon: <FaExclamationTriangle className="text-red-500" />,
      });
    }

    setLoading((l) => ({ ...l, initial: false }));
    return () => clearTimeout(timer);
  }, [API_URL]);

  const companyOptions = [
    { value: "Tana", label: "Tana" },
    { value: "Remote", label: "Remote" },
    { value: "Faritra", label: "Faritra" },
  ];

  const jobOptions = [
    { value: "DevOps", label: "DevOps" },
    { value: "IA", label: "IA" },
    { value: "Dev", label: "Dev" },
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!API_URL) return;

    setLoading((l) => ({ ...l, submit: true }));

    try {
      const response = await axios.post(`${API_URL}/predict`, formData);
      setSalary(response.data.predicted_salary);
      toast.success("Calcul effectué avec succès !", {
        icon: <FaCheckCircle className="text-green-500" />,
      });
    } catch (error) {
      handleApiError(error, "Erreur lors du calcul du salaire");
    } finally {
      setLoading((l) => ({ ...l, submit: false }));
    }
  };

  const handleApiError = (error: unknown, message: string) => {
    let errorMessage = message;
    if (axios.isAxiosError(error)) {
      errorMessage += ` : ${error.response?.data?.message || error.message}`;
    }
    toast.error(errorMessage, {
      icon: <FaExclamationTriangle className="text-red-500" />,
    });
  };

  const handleFeedback = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateFeedback()) return;

    setLoading((l) => ({ ...l, feedback: true }));

    try {
      await axios.post(`${API_URL}/feedback`, {
        ...formData,
        predicted_salary: salary,
        status,
        new_salary: userSalary,
      });

      toast.success("Merci pour votre feedback !", {
        icon: <FaCheckCircle className="text-green-500" />,
      });
      resetForm();
    } catch (error) {
      handleApiError(error, "Erreur lors de l'envoi du feedback");
    } finally {
      setLoading((l) => ({ ...l, feedback: false }));
      setShowModal(false);
    }
  };


  const handleFeedbackAntonony = async () => {
    setLoading((l) => ({ ...l, feedback: true }));
    try {
      await axios.post(`${API_URL}/feedback`, {
        ...formData,
        predicted_salary: salary,
        status,
        new_salary: salary,
      });
      resetForm();
    } catch (error) {
      handleApiError(error, "Erreur lors de l'envoi du feedback");
    }
  };

  const validateFeedback = () => {
    if (userSalary <= 0) {
      toast.error("Veuillez entrer un salaire valide", {
        icon: <FaExclamationTriangle className="text-red-500" />,
      });
      return false;
    }

    const currentSalary = salary || 0;

    if (status === "ambany loatra" && userSalary <= currentSalary) {
      toast.error("Le salaire doit être supérieur à la prédiction", {
        icon: <FaExclamationTriangle className="text-red-500" />,
      });
      return false;
    }

    if (status === "ambony loatra" && userSalary >= currentSalary) {
      toast.error("Le salaire doit être inférieur à la prédiction", {
        icon: <FaExclamationTriangle className="text-red-500" />,
      });
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setFormData({ company: "", title: "", year_experience: 0 });
    setSalary(null);
    setUserSalary(0);
  };

  const handleInputChange = (field: string, value: string | number) => {
    if (field === "year_experience") {
      const numericValue = Math.max(0, Math.min(50, Number(value)));
      setFormData((prev) => ({ ...prev, [field]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  if (loading.initial) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600" />
        </div>
    );
  }

  if (!API_URL) {
    return (
        <div className="min-h-screen flex items-center justify-center flex-col">
          <FaExclamationTriangle className="text-red-500 text-4xl mb-4" />
          <h2 className="text-xl text-red-600 font-bold">
            Erreur de configuration - API_URL non défini
          </h2>
          <p className="text-gray-600 mt-2">
            Veuillez vérifier les variables d'environnement
          </p>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center p-4">
        <Toaster position="top-right" reverseOrder={false} />

        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl">
          <h1 className="text-4xl font-bold text-center text-blue-600 mb-8 flex justify-center items-center">
            <FaMoneyBillWave className="mr-3" /> ML KARAMA
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Champ Entreprise */}
              <div className="relative">
                <label
                    htmlFor="company"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  <FaBuilding className="inline mr-2 text-blue-500" />
                  Orinasa
                </label>
                <select
                    id="company"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                    value={formData.company}
                    onChange={(e) => handleInputChange("company", e.target.value)}
                    required
                >
                  <option value="">Choisir une localisation</option>
                  {companyOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                  ))}
                </select>
              </div>

              {/* Champ Métier */}
              <div className="relative">
                <label
                    htmlFor="title"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  <FaBriefcase className="inline mr-2 text-blue-500" />
                  Asa
                </label>
                <select
                    id="title"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                >
                  <option value="">Choisir un métier</option>
                  {jobOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                  ))}
                </select>
              </div>

              {/* Champ Expérience */}
              <div className="relative col-span-full">
                <label
                    htmlFor="year_experience"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  <FaChartLine className="inline mr-2 text-blue-500" />
                  Taona niasana
                </label>
                <input
                    type="number"
                    id="year_experience"
                    min="0"
                    max="20"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                    value={formData.year_experience}
                    onChange={(e) =>
                        handleInputChange("year_experience", e.target.value)
                    }
                    required
                />
              </div>
            </div>

            <button
                type="submit"
                disabled={loading.submit}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg transition-all flex items-center justify-center hover:bg-blue-700 disabled:opacity-50"
            >
              {loading.submit ? (
                  <FaSpinner className="animate-spin mr-2" />
              ) : (
                  <FaMoneyBillWave className="mr-2" />
              )}
              {loading.submit ? "Calcul en cours..." : "Calculer le Karama"}
            </button>
          </form>

          {salary !== null && (
              <div className="mt-8 animate-fade-in-up">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-md">
                  <p className="text-2xl text-center font-bold text-gray-800">
                <span className="text-4xl text-blue-600">
                  {salary.toLocaleString("fr-FR")}
                </span>{" "}
                    Ar
                  </p>

                  <p className="text-center text-gray-600 mt-4 mb-4">
                    Ce salaire vous paraît-il correct ?
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => {
                          setStatus("ambany loatra");
                          setShowModal(true);
                        }}
                        className="p-4 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-all flex flex-col items-center justify-center"
                    >
                      <FaExclamationTriangle className="text-2xl mb-2" />
                      Ambany loatra
                    </button>
                    <button
                        onClick={() => {
                          handleFeedbackAntonony()
                              .then(response => {
                                console.log(response);})
                              .catch((error) => {
                                console.log(error);});
                          setStatus("antonony");
                          toast.success("Merci pour votre feedback!", {
                            icon: <FaCheckCircle className="text-green-500" />,
                          });
                        }}
                        className="p-4 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl transition-all flex flex-col items-center justify-center"
                    >
                      <FaCheckCircle className="text-2xl mb-2" />
                      Antonony
                    </button>


                    <button
                        onClick={() => {
                          setStatus("ambony loatra");
                          setShowModal(true);
                        }}
                        className="p-4 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-xl transition-all flex flex-col items-center justify-center"
                    >
                      <FaExclamationTriangle className="text-2xl mb-2" />
                      Ambony loatra
                    </button>
                  </div>
                </div>
              </div>
          )}

          {showModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 backdrop-blur-sm">
                <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold flex items-center">
                      <FaMoneyBillWave className="mr-2 text-blue-500" />
                      Votre estimation
                    </h2>
                    <button
                        onClick={() => setShowModal(false)}
                        className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <FaTimes className="text-gray-500" />
                    </button>
                  </div>

                  <form onSubmit={handleFeedback}>
                    <div className="relative">
                      <input
                          type="number"
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 text-lg font-medium"
                          placeholder="Entrez le montant"
                          value={userSalary || ""}
                          onChange={(e) => setUserSalary(Number(e.target.value))}
                          min="0"
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    Ar
                  </span>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <button
                          type="button"
                          onClick={() => setShowModal(false)}
                          className="py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
                      >
                        Annuler
                      </button>
                      <button
                          type="submit"
                          disabled={loading.feedback}
                          className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all flex items-center justify-center disabled:opacity-50"
                      >
                        {loading.feedback ? (
                            <FaSpinner className="animate-spin mr-2" />
                        ) : (
                            <FaCheckCircle className="mr-2" />
                        )}
                        {loading.feedback ? "Envoi en cours..." : "Confirmer"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
          )}
        </div>
      </div>
  );
}