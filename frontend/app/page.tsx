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
  FaTimes
} from "react-icons/fa";
import { toast, Toaster } from "react-hot-toast";

interface Job {
  company: string;
  title: string;
  year_experience: number;
}

export default function Home() {
  const [company, setCompany] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [year_experience, setYearExperience] = useState<number>(0);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [salary, setSalary] = useState<number>(0);
  const [showModal, setShowModal] = useState(false);
  const [userSalary, setUserSalary] = useState<number>(0);
  const [new_salary, setSalaryFeedback] = useState<number>(0);
  const [lastData, setLastData] = useState<Job[]>([]);
  const [predicted_salary, setFirstSalary] = useState<number>(0);
  const [status, setStatus] = useState<string>("normal");

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const companyOptions = [
    { value: "Tana", label: "Tana", icon: <FaBuilding className="inline mr-2" /> },
    { value: "Remote", label: "Remote", icon: <FaBriefcase className="inline mr-2" /> },
    { value: "Faritra", label: "Faritra", icon: <FaBuilding className="inline mr-2" /> },
  ];

  const jobOptions = [
    { value: "DevOps", label: "DevOps", icon: <FaChartLine className="inline mr-2" /> },
    { value: "IA", label: "IA", icon: <FaBriefcase className="inline mr-2" /> },
    { value: "Dev", label: "Dev", icon: <FaBriefcase className="inline mr-2" /> },
  ];

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`https://dev-api-karama.brocoding.icu`);
      setJobs(response.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const newJob = { company, title, year_experience };

    try {
      const response = await axios.post(
          `https://dev-api-karama.brocoding.icu/predict`,
          newJob,
      );
      const predictedSalary = response.data.predicted_salary;

      setSalary(predictedSalary);
      setLastData(response.data);
      setFirstSalary(predictedSalary);
    } catch (error) {
      toast.error("Erreur lors du calcul du salaire", {
        icon: <FaExclamationTriangle className="text-red-500" />,
      });
    }
  };

  const handleLow = () => {
    setStatus("ambany loatra");
    setShowModal(true);
  };

  const handleNormal = () => {
    setStatus("antonony");
    toast.success("Merci pour votre feedback!", {
      icon: <FaCheckCircle className="text-green-500" />,
    });
  };

  const handleHigh = () => {
    setStatus("ambony loatra");
    setShowModal(true);
  };

  const handleModalSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userSalary) {
      toast.error("Veuillez entrer un salaire valide", {
        icon: <FaExclamationTriangle className="text-red-500" />,
      });
      return;
    }

    if (status === "ambany loatra") {
      if (userSalary > salary) {
        setSalaryFeedback(userSalary);
        setShowModal(false);
        const dataApi = {
          company,
          title,
          year_experience,
          predicted_salary,
          status,
          new_salary: userSalary,
        };

        try {
          await axios.post(
              `https://dev-api-karama.brocoding.icu/feedback`,
              dataApi,
          );
          toast.success("Feedback envoyé avec succès!", {
            icon: <FaCheckCircle className="text-green-500" />,
          });
        } catch (error) {
          console.error("Error sending feedback:", error);
        }
      } else {
        toast.error("Le salaire doit être supérieur à la prédiction", {
          icon: <FaExclamationTriangle className="text-red-500" />,
        });
      }
    } else if (status === "ambony loatra") {
      if (userSalary < salary) {
        setSalaryFeedback(userSalary);
        setShowModal(false);
        const dataApi = {
          company,
          title,
          year_experience,
          predicted_salary,
          status,
          new_salary: userSalary,
        };

        try {
          await axios.post(
              `https://dev-api-karama.brocoding.icu/feedback`,
              dataApi,
          );
          toast.success("Feedback envoyé avec succès!", {
            icon: <FaCheckCircle className="text-green-500" />,
          });
        } catch (error) {
          console.error("Error sending feedback:", error);
        }
      } else {
        toast.error("Le salaire doit être inférieur à la prédiction", {
          icon: <FaExclamationTriangle className="text-red-500" />,
        });
      }
    }
  };

  return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center p-4">
        <Toaster position="top-right" reverseOrder={false} />

        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl transition-all duration-300 hover:shadow-3xl">
          <h1 className="text-4xl font-bold text-center text-blue-600 mb-8 flex justify-center items-center">
            <FaMoneyBillWave className="mr-3" /> ML KARAMA
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaBuilding className="inline mr-2 text-blue-500" />
                  Orinasa
                </label>
                <select
                    id="company"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                >
                  <option value="">Choisir une localisation</option>
                  {companyOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.icon} {opt.label}
                      </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaBriefcase className="inline mr-2 text-blue-500" />
                  Asa
                </label>
                <select
                    id="title"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                >
                  <option value="">Choisir un métier</option>
                  {jobOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.icon} {opt.label}
                      </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FaChartLine className="inline mr-2 text-blue-500" />
                Taona niasana
              </label>
              <input
                  type="number"
                  id="yearExperience"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  value={year_experience}
                  onChange={(e) => setYearExperience(Number(e.target.value))}
                  required
              />
            </div>

            <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
            >
              <FaMoneyBillWave className="mr-2" />
              Calculer le Karama
            </button>
          </form>

          {salary > 0 && (
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
                        onClick={handleLow}
                        className="p-4 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-all flex flex-col items-center justify-center hover:shadow-md"
                    >
                      <FaExclamationTriangle className="text-2xl mb-2" />
                      Ambany loatra
                    </button>
                    <button
                        onClick={handleNormal}
                        className="p-4 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl transition-all flex flex-col items-center justify-center hover:shadow-md"
                    >
                      <FaCheckCircle className="text-2xl mb-2" />
                      Antonony
                    </button>
                    <button
                        onClick={handleHigh}
                        className="p-4 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-xl transition-all flex flex-col items-center justify-center hover:shadow-md"
                    >
                      <FaExclamationTriangle className="text-2xl mb-2" />
                      Ambony loatra
                    </button>
                  </div>
                </div>
              </div>
          )}
        </div>

        {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 backdrop-blur-sm">
              <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full animate-pop-in">
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

                <form onSubmit={handleModalSubmit}>
                  <div className="relative">
                    <input
                        type="number"
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 text-lg font-medium"
                        placeholder="Entrez le montant"
                        value={userSalary}
                        onChange={(e) => setUserSalary(Number(e.target.value))}
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">Ar</span>
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
                        className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all flex items-center justify-center"
                    >
                      <FaCheckCircle className="mr-2" />
                      Confirmer
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}
      </div>
  );
}