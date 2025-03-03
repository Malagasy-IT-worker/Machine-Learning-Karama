"use client";
import { useState, useEffect, FormEvent } from "react";
import axios from "axios";
import { log } from "console";

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
  const [predicted_salary, setFirstSalary] = useState<Job[]>([]);
  const [status, setStatus] = useState<string>("low");

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  console.log(API_URL);
  // Récupérer les offres d'emploi
  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${API_URL}`);
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
    const newJob = { company, title, year_experience: year_experience };

    try {
      const response = await axios.post(`${API_URL}/predict`, newJob);
      const predictedSalary = response.data.predicted_salary;

      setSalary(predictedSalary);
      setLastData(response.data);
      setFirstSalary(predictedSalary);
    } catch (error) {
      console.error("Error creating job:", error);
    }
  };

  const handleSalaryFeedback = (feedback: string) => {
    setShowModal(true);
  };

  const handleModalSubmit = async () => {
    setSalaryFeedback(userSalary);
    setShowModal(false);

    console.log("Le nouveau salaire est : " + new_salary);
    const dataApi = {
      company,
      title,
      year_experience,
      predicted_salary,
      status,
      new_salary,
    };

    try {
      const response = await axios.post(`${API_URL}/feedback`, dataApi);
      console.log(response);
    } catch (error) {
      console.error("Error creating job:", error);
    }
    console.log(dataApi);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h1 className="text-3xl font-semibold text-center text-blue-600 mb-8">
          ML KARAMA
        </h1>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sélection du company */}
          <div>
            <label
              className="block text-sm font-medium text-gray-700"
              htmlFor="company"
            >
              Orinasa
            </label>
            <select
              id="company"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
            >
              <option value="">Misafidy toerana</option>
              <option value="Tana">Tana</option>
              <option value="Remote">Remote</option>
              <option value="Faritra">Faritra</option>
            </select>
          </div>

          {/* Sélection du title */}
          <div>
            <label
              className="block text-sm font-medium text-gray-700"
              htmlFor="title"
            >
              Asa
            </label>
            <select
              id="title"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            >
              <option value="">Misafisy Asa</option>
              <option value="DevOps">DevOps</option>
              <option value="IA">IA</option>
              <option value="Dev">Dev</option>
            </select>
          </div>

          {/* Sélection des années d'expérience */}
          <div>
            <label
              className="block text-sm font-medium text-gray-700"
              htmlFor="yearExperience"
            >
              Taona niasana
            </label>
            <input
              type="number"
              id="yearExperience"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={year_experience}
              onChange={(e) => setYearExperience(Number(e.target.value))}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-200"
          >
            Karama
          </button>
        </form>

        {/* Liste des offres */}
        <div className="mt-8">
          {salary > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg shadow-md mb-4">
              <p className="text-gray-600 text-center">
                {salary.toLocaleString("es-ES")} Ar
              </p>

              {/* Demande de feedback sur le salaire */}
              <p className="text-center mt-4">Do you think this salary is:</p>
              <div className="flex justify-center space-x-4 mt-2">
                <button
                  onClick={() => handleSalaryFeedback("Low Salary")}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Low
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-green-700">
                  Normal
                </button>
                <button
                  onClick={() => handleSalaryFeedback("High Salary")}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  High
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modale pour saisir le salaire */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-semibold text-center mb-4">
              Enter your expected salary
            </h2>
            <input
              type="number"
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              value={userSalary}
              onChange={(e) => setUserSalary(Number(e.target.value))}
              placeholder="Enter salary"
              required
            />
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleModalSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
