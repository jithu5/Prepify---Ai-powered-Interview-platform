'use client';

import { useState } from 'react';
import axios from 'axios';

export default function StartInterview() {
    const [formData, setFormData] = useState({
        position: '',
        level: '',
        interviewType: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Interview started with:', formData);
        // route to next page or trigger interview logic

      try {
          const {data} = await axios.post('/api/start-interview-session', {
              position: formData.position,
              type: formData.interviewType,
              level: formData.level,
          }, {
              headers: {
                  'Content-Type': 'application/json',
              },
              withCredentials: true
          })
  
          if (data.success) {
              console.log('Interview session started successfully:', data.data);
              window.location.href = `/interview/${data.data.id}`;
          } else {
              console.error('Error starting interview session:', data.message);
              alert(data.message);
          }
      } catch (error) {
        console.log(error)
      }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6">
            <div className="max-w-xl w-full bg-white p-10 rounded-2xl shadow-xl">
                <h1 className="text-3xl font-bold text-center mb-4">Let's Get Started</h1>
                <p className="text-gray-600 text-center mb-8">
                    Fill in your details so we can generate a personalized interview experience.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>

                        <label className="block text-sm font-medium text-gray-700 mb-1">Role You're Preparing For</label>
                        <input
                            type="text"
                            name="position"
                            required
                            value={formData.position}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                            placeholder="e.g., Devops Engineer"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Your Level
                        </label>
                        <select
                            name="level"
                            required
                            value={formData.level}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 outline-none bg-white"
                        >
                            <option value="">-- Choose Level --</option>
                            <option value="intern">Intern</option>
                            <option value="entry">Entry Level</option>
                            <option value="junior">Junior Developer</option>
                            <option value="senior">Senior Developer</option>
                        </select>
                    </div>


                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Interview Type
                        </label>
                        <select
                            name="interviewType"
                            required
                            value={formData.interviewType || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 outline-none bg-white"
                        >
                            <option value="">-- Choose Type --</option>
                            <option value="technical">Technical</option>
                            <option value="behavioral">Behavioral</option>
                        </select>
                    </div>


                    <button
                        onClick={handleSubmit}
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
                    >
                        Start Interview
                    </button>
                </form>
            </div>
        </div>
    );
}
