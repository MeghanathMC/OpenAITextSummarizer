// import "./App.css";
import { useEffect, useState } from "react";
import Delete from "./assets/delete.png";

function App() {
  const [value, setValue] = useState("");
  const [data, setData] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [isCopy, setIsCopy] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.REACT_APP_OPENAI_KEY}`,
      },
      body: JSON.stringify({
        prompt: value + `\n\nTl;dr`,
        temperature: 0.1,
        max_tokens: Math.floor(value.length / 2),
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0.5,
        stop: ['"""'],
      }),
    };

    fetch(
      "https://api.openai.com/v1/engines/text-davinci-003/completions",
      requestOptions
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((dt) => {
        const text = dt.choices[0]?.text.trim();
        setSubmitting(false);

        if (text) {
          const updatedData = [...data, text];
          localStorage.setItem("summary", JSON.stringify(updatedData));
          setData(updatedData);
        } else {
          throw new Error("Unexpected API response format");
        }
      })
      .catch((error) => {
        setSubmitting(false);
        setError(error.message);
        console.log(error);
      });
  };

  // console.log(`API Key: ${process.env.REACT_APP_OPENAI_KEY}`);

  const fetchLocalStorage = () => {
    const result = localStorage.getItem("summary");
    if (result) {
      setData(JSON.parse(result).reverse());
    }
  };

  async function copyTextToClipboard(text) {
    if ("clipboard" in navigator) {
      return await navigator.clipboard.writeText(text);
    }
  }

  const handleCopy = (txt) => {
    copyTextToClipboard(txt)
      .then(() => {
        setIsCopy(true);
        setTimeout(() => {
          setIsCopy(false);
        }, 1500);
      })
      .catch((err) => console.log(err));
  };

  const handleDelete = (txt) => {
    const filtered = data.filter((d) => d !== txt);
    setData(filtered);
    localStorage.setItem("summary", JSON.stringify(filtered));
  };

  useEffect(() => {
    fetchLocalStorage();
  }, []);

  return (
    <div className="w-full bg-[#0f172a] h-full min-h-[100vh] py-4 px-4 md:px-20">
      <div className="w-full">
        <div className="flex flex-row justify-between items-center w-full h-10 px-5 2xl:px-40">
          <h3 className="cursor-pointer text-3xl font-bold text-cyan-600">
            Summary
          </h3>
        </div>

        <div className="flex flex-col items-center justify-center mt-4 p-4">
          <h1 className="text-3xl text-white text-center leading-10 font-semibold">
            Summarizer with <br />
            <span className="text-5xl font-bold text-cyan-500">OpenAI GPT</span>
          </h1>
          <p className="mt-5 text-lg text-gray-500 sm:text-xl text-center max-w-2xl">
            Simply upload your document and get a quick summary using our
            summarizer
          </p>
        </div>

        <div className="flex flex-col w-ful items-center justify-content mt-5">
          <textarea
            placeholder="Paste your doc content here..."
            rows={6}
            className="block w-full md:w-[650px] rounded-md border-slate-700 bg-slate-800 p-2 text-sm shadow-lg font-medium text-white focus:border-gray-500 focus:outline-none focus:ring-0"
            onChange={(e) => setValue(e.target.value)}
          ></textarea>

          {value.length > 0 &&
            (submitting ? (
              <p className="text-md text-cyan-500 mt-5">Please wait......</p>
            ) : (
              <button
                className="mt-5 bg-blue-500 px-5 py-2 text-white text-md font- cursor-pointer rounded-md"
                onClick={handleSubmit}
              >
                Submit
              </button>
            ))}
        </div>
      </div>

      {error && (
        <div className="w-full mt-5 text-red-500 text-center">
          Error: {error}
        </div>
      )}

      <div className="w-full mt-10 flex flex-col gap-5 shadow-md items-center justify-center">
        {data.length > 0 && (
          <>
            <p className="text-white font-semibold text-lg">Summary History</p>
            {data.map((d, index) => (
              <div
                key={index}
                className="max-w-2xl bg-slate-800 p-3 rounded-md"
              >
                <p className="text-gray-400 text-lg">{d}</p>
                <div className="flex gap-5 items-center justify-end mt-2">
                  <p
                    className="text-gray-500 font-semibold cursor-pointer"
                    onClick={() => handleCopy(d)}
                  >
                    {isCopy ? "Copied" : "Copy"}
                  </p>
                  <span
                    className="cursor-pointer"
                    onClick={() => handleDelete(d)}
                  >
                    <img src={Delete} className="w-6 h-6" alt="Delete" />
                  </span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
