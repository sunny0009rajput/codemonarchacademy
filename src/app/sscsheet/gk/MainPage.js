"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, FileText, Star, Youtube } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Navbar from "@/app/Navbar";

export default function Page() {
  const [chapters, setChapters] = useState([]);
  const [chapterData, setChapterData] = useState({});
  const [expandedChapters, setExpandedChapters] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  const [completedConcepts, setCompletedConcepts] = useState({});
  const [completedProblems, setCompletedProblems] = useState({});
  const [favourites, setFavourites] = useState({});
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("customerToken")
      : null;

  const apibackendurl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const apidatasheeturl = process.env.NEXT_PUBLIC_DATASHEET_URLGK;
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  // 🔹 Fetch all chapters
  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const res = await axios.get(`${apidatasheeturl}/chapters`);
        const chaptersList = res.data || [];
        setChapters(chaptersList);
        setLoading(false);

        chaptersList.forEach((chapter, idx) => {
          setTimeout(() => fetchChapterAndProgress(chapter), idx * 400);
        });
      } catch (err) {
        console.error("Error fetching chapters:", err);
        setLoading(false);
      }
    };
    fetchChapters();
  }, []);

  // 🔹 Fetch each chapter's data and user progress
  const fetchChapterAndProgress = async (chapter) => {
    const chapterKey = chapter.title.replace(/\s/g, "_");
    const cachedData =
      typeof window !== "undefined" ? localStorage.getItem(chapterKey) : null;

    let data = null;
    if (cachedData) {
      data = JSON.parse(cachedData);
      setChapterData((prev) => ({ ...prev, [chapter.title]: data }));
    } else {
      try {
        const res = await axios.get(`${apidatasheeturl}/${chapterKey}`);
        data = res.data;
        setChapterData((prev) => ({ ...prev, [chapter.title]: data }));
        localStorage.setItem(chapterKey, JSON.stringify(res.data));
      } catch (err) {
        console.error(`Error fetching data for ${chapter.title}:`, err);
      }
    }

    if (!token || !data) return;

    const uniqueConcepts = Array.from(
      new Map(data?.[0]?.Concept?.map((c) => [c.concept, c])).values()
    );
    const uniqueProblems = Array.from(
      new Map(data?.[1]?.Questions?.map((q) => [q.id, q])).values()
    );

    // Initialize progress only if not already
    try {
      await axios.post(
        `${apibackendurl}/userprogress/init`,
        {
          topicId: chapterKey,
          totalConcepts: uniqueConcepts.length,
          totalQuestions: uniqueProblems.length,
        },
        axiosConfig
      );
    } catch {
      /* already initialized */
    }

    // Fetch user progress
    try {
      const progressRes = await axios.get(
        `${apibackendurl}/userprogress/${chapterKey}`,
        axiosConfig
      );
      const { completedConcepts = [], completedQuestions = [] } =
        progressRes.data;

      const conceptsDone = {};
      completedConcepts.forEach((id) => {
        conceptsDone[`${chapter.title}-${id}`] = true;
      });

      const problemsDone = {};
      completedQuestions.forEach((id) => {
        problemsDone[`${chapter.title}-problem-${id}`] = true;
      });

      setCompletedConcepts((prev) => ({ ...prev, ...conceptsDone }));
      setCompletedProblems((prev) => ({ ...prev, ...problemsDone }));
    } catch (err) {
      console.error(`Error fetching progress for ${chapter.title}:`, err);
    }

    // Fetch favourites
    try {
      const favRes = await axios.get(
        `${apibackendurl}/userprogress/favourite/${chapterKey}`,
        axiosConfig
      );
      const favData = {};
      favRes.data.forEach((fav) => {
        const key = `${chapter.title}-${
          fav.type === "concept" ? fav.itemId : `problem-${fav.itemId}`
        }`;
        favData[key] = true;
      });
      setFavourites((prev) => ({ ...prev, ...favData }));
    } catch (err) {
      console.error(`Error fetching favourites for ${chapter.title}:`, err);
    }
  };

  // 🔹 Utility: toggles
  const toggleChapter = (title) =>
    setExpandedChapters((prev) => ({ ...prev, [title]: !prev[title] }));

  const toggleSection = (title, section) =>
    setExpandedSections((prev) => ({
      ...prev,
      [`${title}-${section}`]: !prev[`${title}-${section}`],
    }));

  // 🔹 Handle Problem Checkbox
  const handleProblemCheck = async (chapterTitle, problemId) => {
    if (!token) return router.push("/customerlogin");
    const key = `${chapterTitle}-problem-${problemId}`;
    const completed = !completedProblems[key];
    setCompletedProblems((prev) => ({ ...prev, [key]: completed }));

    try {
      await axios.put(
        `${apibackendurl}/userprogress/update`,
        {
          topicId: chapterTitle.replace(/\s/g, "_"),
          type: "question",
          id: problemId,
          completed,
        },
        axiosConfig
      );
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFavourite = async (chapterTitle, type, itemId, currentFav) => {
    if (!token) return router.push("/customerlogin");
    try {
      const res = await axios.post(
        `${apibackendurl}/userprogress/favourite/toggle`,
        {
          topicId: chapterTitle.replace(/\s/g, "_"),
          type,
          itemId,
          favourite: !currentFav,
        },
        axiosConfig
      );
      return res.data.favourite.favourite;
    } catch (err) {
      console.error(err);
    }
  };

  const truncateWords = (text) => {
    if (!text) return "";
    const words = text.split(" ");
    const limit = window.innerWidth < 640 ? 5 : 10;
    return words.length <= limit
      ? text
      : words.slice(0, limit).join(" ") + "...";
  };

  if (loading) return <p className="text-white">Loading chapters...</p>;

  return (
    <div className="min-h-screen bg-black text-white pt-18 px-2 py-2 lg:px-28 lg:py-28">
      <Navbar />
      <h1 className="text-3xl font-bold pt-10 mb-6">
        Strivers A2Z DSA Course
      </h1>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => router.push("/sscsheet/gk/revision")}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition"
        >
          Revision
        </button>
      </div>

      {chapters.map((chapter) => {
        const data = chapterData[chapter.title] || [];
        const isExpanded = expandedChapters[chapter.title];
        const uniqueProblems = Array.from(
          new Map(data?.[1]?.Questions?.map((q) => [q.id, q])).values()
        );

        const totalProblems = uniqueProblems.length || 0;
        const completedProblemCount = uniqueProblems.filter(
          (q) => completedProblems[`${chapter.title}-problem-${q.id}`]
        ).length;

        // ✅ FIX: If no questions, progress = 0 (no false “1”)
        const progressPercent =
          totalProblems > 0
            ? (completedProblemCount / totalProblems) * 100
            : 0;

        return (
          <div
            key={chapter.id}
            className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden mb-6"
          >
            {/* Chapter Header */}
            <div
              className="p-4 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-zinc-800 transition"
              onClick={() => toggleChapter(chapter.title)}
            >
              <div className="flex items-center gap-4">
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                )}
                <h2 className="text-xl sm:text-2xl font-semibold">
                  {chapter.title}
                </h2>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden sm:block w-48 lg:w-64 bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-orange-500 h-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-gray-400 text-sm font-medium">
                  {completedProblemCount} / {totalProblems}
                </span>
              </div>
            </div>

            {/* Problems Section */}
            {isExpanded && totalProblems > 0 && (
              <div className="border-t border-zinc-800 p-4 sm:p-6">
                <table className="w-full">
                  <thead className="bg-zinc-800 text-gray-400 text-xs sm:text-sm">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">
                        Progress
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Questions
                      </th>
                      <th className="px-4 py-3 text-center font-medium">
                        Notes / Solution
                      </th>
                      <th className="px-4 py-3 text-center font-medium">
                        Video
                      </th>
                      <th className="px-4 py-3 text-center font-medium">
                        Favourite
                      </th>
                      <th className="px-4 py-3 text-center font-medium">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {uniqueProblems.map((q) => {
                      const key = `${chapter.title}-problem-${q.id}`;
                      return (
                        <tr
                          key={q.id}
                          className="border-t border-zinc-800 hover:bg-zinc-800 transition"
                        >
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={!!completedProblems[key]}
                              onChange={() =>
                                handleProblemCheck(chapter.title, q.id)
                              }
                              className="w-4 h-4 accent-orange-500"
                            />
                          </td>
                          <td className="px-4 py-4">
                            {q.question?.type === "text" ? (
                              truncateWords(q.question.content)
                            ) : (
                              <img
                                src={q.question.content}
                                alt="question"
                                className="max-w-full rounded"
                              />
                            )}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <button
                              onClick={() =>
                                window.open(
                                  `/sscsheet/gk/problem/${q.id}?chapter=${encodeURIComponent(
                                    chapter.title
                                  )}`,
                                  "_blank"
                                )
                              }
                              className="text-gray-400 hover:text-white"
                            >
                              <FileText className="w-6 h-6 mx-auto" />
                            </button>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <button
                              onClick={() =>
                                window.open(
                                  `/sscsheet/gk/problem/${q.id}?chapter=${encodeURIComponent(
                                    chapter.title
                                  )}`,
                                  "_blank"
                                )
                              }
                              className="text-red-500 hover:text-red-400"
                            >
                              <Youtube className="w-6 h-6 mx-auto" />
                            </button>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <button
                              onClick={async () => {
                                const updatedFav = await toggleFavourite(
                                  chapter.title,
                                  "question",
                                  q.id,
                                  favourites[key]
                                );
                                setFavourites((prev) => ({
                                  ...prev,
                                  [key]: updatedFav,
                                }));
                              }}
                              className={`transition ${
                                favourites[key]
                                  ? "text-yellow-300"
                                  : "text-yellow-400 hover:text-yellow-300"
                              }`}
                            >
                              <Star
                                className={`w-5 h-5 mx-auto ${
                                  favourites[key] ? "fill-yellow-300" : ""
                                }`}
                              />
                            </button>
                          </td>

                          {/* ✅ Status Column */}
                          <td className="px-4 py-4 text-center text-green-500">
                            {q.status || "Pending"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
