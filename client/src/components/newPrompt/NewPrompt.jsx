import { useEffect, useRef, useState, useCallback } from "react";
import "./newPrompt.css";
import Upload from "../upload/Upload";
import { IKImage } from "imagekitio-react";
import model from "../../lib/gemini";
import Markdown from "react-markdown";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const NewPrompt = ({ data }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [img, setImg] = useState({
    isLoading: false,
    error: "",
    dbData: {},
    aiData: {},
  });

  const chatRef = useRef(null);
  const hasRun = useRef(false);
  const endRef = useRef(null);
  const formRef = useRef(null);
  const queryClient = useQueryClient();

  // Build chat history only once
  useEffect(() => {
    if (data?.history && !chatRef.current) {
      chatRef.current = model.startChat({
        history: data.history.map(({ role, parts }) => ({
          role,
          parts: [{ text: parts[0].text }],
        })),
      });
    }
  }, [data?.history]);

  // Auto-scroll
  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [data, question, answer, img.dbData]);

  // Mutation to save Q/A and image path
  const mutation = useMutation({
    mutationFn: ({ question, answer, imgPath }) =>
      fetch(`${import.meta.env.VITE_API_URL}/api/chats/${data._id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer, img: imgPath }),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", data._id] }).then(() => {
        formRef.current?.reset();
        setQuestion("");
        setAnswer("");
        setImg({ isLoading: false, error: "", dbData: {}, aiData: {} });
      });
    },
    onError: (err) => console.error(err),
  });

  // send message & get streamed response
  const add = useCallback(
    async (text, isInitial) => {
      if (!chatRef.current) return;
      if (!isInitial) setQuestion(text);

      try {
        const result = await chatRef.current.sendMessageStream(
          Object.keys(img.aiData).length ? [img.aiData, text] : [text]
        );

        let accumulated = "";
        for await (const chunk of result.stream) {
          accumulated += chunk.text();
          setAnswer(accumulated);
        }

        mutation.mutate({
          question: text || undefined,
          answer: accumulated,
          imgPath: img.dbData?.filePath,
        });
      } catch (err) {
        console.error(err);
      }
    },
    [img.aiData, img.dbData?.filePath, mutation]
  );

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    const text = e.target.text.value.trim();
    if (text) add(text, false);
  };

  // Trigger first AI message only once
  useEffect(() => {
    if (!hasRun.current && data?.history?.length === 1) {
      add(data.history[0].parts[0].text, true);
      hasRun.current = true;
    }
  }, [add, data?.history]);

  return (
    <>
      {img.isLoading && <div className="loading">Uploading image…</div>}

      {img.dbData?.filePath && (
        <IKImage
          urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
          path={img.dbData.filePath}
          transformation={[{ width: 380 }]}
          width="380"
        />
      )}

      {question && <div className="message user">{question}</div>}

      {answer && (
        <div className="message">
          <Markdown>{answer}</Markdown>
        </div>
      )}

      <div ref={endRef} />

      <form className="newForm" onSubmit={handleSubmit} ref={formRef}>
        <Upload setImg={setImg} />
        <input type="text" name="text" placeholder="Ask anything…" autoComplete="off" />
        <button type="submit">
          <img src="/arrow.png" alt="Send" />
        </button>
      </form>
    </>
  );
};

export default NewPrompt;
