import { useState } from "react";
import { crearOrientacion, crearPreguntas } from "./utils/funciones.js";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "/mkk.png";

type Pregunta = {
  pregunta: string;
};

interface IOrientacion {
  orientacion: string;
  urgencia: number;
  explicacionUrgencia: string;
  palabrasclave: string[];
}

type Resultado = {
  pregunta: string;
  respuesta: string;
};

const variants = {
  enter: { x: "-100vw", opacity: 0 },
  center: { x: "0", opacity: 1 },
  exit: { x: "100vw", opacity: 0 },
};

export default function App() {
  const [load, setLoad] = useState(false);
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [textoConsulta, setTextoConsulta] = useState<string>("");
  const [limiteDeCaracteres] = useState(200);
  const [indiceActual, setIndiceActual] = useState<number | null>(null);
  const [respuestaActual, setRespuestaActual] = useState<string>("");
  const [resultados, setResultados] = useState<
    { pregunta: string; respuesta: string }[]
  >([]);
  const [aceptarTerminos, setAceptarTerminos] = useState(false);
  const [orientacion, setOrientacion] = useState<IOrientacion>({
    orientacion: "",
    urgencia: 0,
    explicacionUrgencia: "",
    palabrasclave: [],
  });

  const handleClick = async () => {
    if (!aceptarTerminos) {
      alert("Por favor, acepta los términos y condiciones antes de continuar.");
      return;
    }
    setLoad(true);
    const res = await crearPreguntas(textoConsulta);
    setPreguntas(res);
    setLoad(false);
    setIndiceActual(0);
  };

  const handleAnterior = () => {
    setIndiceActual((prev) => (prev !== null ? prev - 1 : null));
    const respuestaAnterior = resultados[indiceActual! - 1]?.respuesta || "";
    setRespuestaActual(respuestaAnterior);
  };

  const handleSiguiente = () => {
    if (respuestaActual.trim() === "") {
      alert("Por favor, ingresa una respuesta.");
      return;
    }

    setResultados((prev) => {
      const updated = [...prev];
      updated[indiceActual!] = {
        pregunta: preguntas[indiceActual!].pregunta,
        respuesta: respuestaActual,
      };
      return updated;
    });

    if (indiceActual === preguntas.length - 2) {
      setRespuestaActual("");
      setIndiceActual((prev) => (prev !== null ? prev + 1 : null));
    } else if (indiceActual === preguntas.length - 1) {
      setIndiceActual(null);
      setTextoConsulta("");
    } else {
      setIndiceActual((prev) => (prev !== null ? prev + 1 : null));
      setRespuestaActual("");
    }
  };

  function resultadosToString(lista: Resultado[]): string {
    return lista
      .map(
        (item, index) => `${index + 1}. ${item.pregunta}\n${item.respuesta}\n`
      )
      .join("");
  }

  const handleOrientacion = async () => {
    if (respuestaActual.trim() === "") {
      alert("Por favor, ingresa una respuesta.");
      return;
    }

    setLoad(true);
    const res = await crearOrientacion(
      textoConsulta,
      resultadosToString(resultados)
    );
    setOrientacion(res);
    setLoad(false);
  };

  const handleReset = () => {
    setPreguntas([]);
    setTextoConsulta("");
    setIndiceActual(null);
    setRespuestaActual("");
    setResultados([]);
    setAceptarTerminos(false);
    setOrientacion({
      orientacion: "",
      urgencia: 0,
      explicacionUrgencia: "",
      palabrasclave: [],
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.8,
        delay: 0.5,
        ease: [0, 0.71, 0.2, 1.01],
      }}
      className={`container flex flex-col items-start ${
        orientacion.orientacion ? "justify-start" : "justify-center"
      } pt-5 h-screen font-sans mx-auto w-full max-w-screen-sm overflow-y-auto p-4`}
      style={{ fontFamily: "Ubuntu", overflowY: "auto", height: "100vh" }}
    >
      {/* Titulo */}
      {!load && (
        <div className="flex justify-center items-center h-[50px] w-full">
          <h1 className="text-2xl text-gray-700 mb-5 font-medium text-center">
            Asistencia médica
          </h1>
        </div>
      )}

      {/* Inicio */}
      {indiceActual === null &&
        !load &&
        resultados.length !== 7 &&
        !orientacion.orientacion && (
          <div className="flex justify-center items-center h-[50px] w-full">
            <p className="text-gray-600 mb-5 text-sm text-center">
              Describe tus síntomas, molestias o dudas. Cuanto más completa sea
              la descripción, mejor.
            </p>
          </div>
        )}

      {indiceActual === null &&
        !load &&
        resultados.length !== 7 &&
        !orientacion.orientacion && (
          <div className="flex flex-col items-center justify-center space-y-4 w-full">
            {/* Contenedor del textarea y el contador */}
            <div className="relative w-full mb-5">
              <textarea
                value={textoConsulta}
                onChange={(e) => {
                  if (e.target.value.length <= limiteDeCaracteres) {
                    setTextoConsulta(e.target.value);
                  }
                }}
                maxLength={limiteDeCaracteres}
                className="p-2 w-full h-32 rounded text-sm p-4 border border-[#8276f4] focus:outline-none focus:border-[#7368d4] focus:ring-1 focus:ring-[#8276f4] shadow resize-none text-gray-600 h-60"
                placeholder="Por ejemplo: Me duele la cabeza hace 2 horas de forma constante y no logro dormir..."
              />

              {/* Contador posicionado dentro del textarea */}
              <div className="absolute bottom-3 right-3 text-sm text-gray-400">
                {-(textoConsulta.length - limiteDeCaracteres)}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="terminos"
                className="mr-2 form-checkbox text-[#8276f4] focus:ring-[#8276f4]"
                checked={aceptarTerminos}
                onChange={() => setAceptarTerminos((prev) => !prev)}
              />
              <label htmlFor="terminos" className="text-sm text-gray-600">
                Acepto los términos y condiciones
              </label>
            </div>

            {/* Botón que estará desactivado si no hay texto */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!textoConsulta.trim()}
              className={`p-2 ${
                textoConsulta.trim() ? "bg-[#8276f4]" : "bg-gray-300"
              } text-white rounded-[12px] px-8 text-sm font-medium`}
              onClick={handleClick}
            >
              🩺 Preguntar
            </motion.button>
          </div>
        )}

      {/* Cargando */}
      {load && (
        <AnimatePresence>
          <motion.div
            key="Cargando"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }} // Añadido para la animación de salida
            transition={{
              duration: 0.8,
              delay: 0.5,
              ease: [0, 0.71, 0.2, 1.01],
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="flex flex-col items-center">
              <motion.img
                src={Logo}
                alt="Cargando"
                className="w-12 h-12"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  type: "spring",
                  stiffness: 100,
                  damping: 10,
                }}
              />
              <p className="text-gray-400 text-center">Cargando...</p>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Descripcion y preguntas */}
      {indiceActual !== null && !orientacion.orientacion && !load && (
        <div className="flex justify-center items-center h-[50px] w-full">
          <p className="text-gray-600 mb-10 text-sm text-center">
            Responde estas preguntas para tener más antecedentes de lo que te
            ocurre.
          </p>
        </div>
      )}
      <AnimatePresence mode="wait">
        {indiceActual !== null && !orientacion.orientacion && !load && (
          <motion.div
            key={indiceActual}
            initial="enter"
            animate="center"
            exit="exit"
            variants={variants}
            className="flex flex-col items-center w-full"
          >
            <p className="text-gray-600 mb-10 text-md text-center font-medium">
              {preguntas[indiceActual].pregunta}
            </p>

            {/* Contenedor del textarea y el contador */}
            <div className="relative w-full mb-2">
              <textarea
                value={respuestaActual}
                onChange={(e) => {
                  if (e.target.value.length <= limiteDeCaracteres) {
                    setRespuestaActual(e.target.value);
                  }
                }}
                maxLength={limiteDeCaracteres}
                className="p-2 w-full h-32 rounded text-sm p-4 border border-[#8276f4] focus:outline-none focus:border-[#7368d4] focus:ring-1 focus:ring-[#8276f4] shadow resize-none text-gray-600 h-20"
                placeholder="Ingresa tu respuesta"
              />

              {/* Contador posicionado dentro del textarea */}
              <div className="absolute bottom-3 right-3 text-sm text-gray-400">
                {-(respuestaActual.length - limiteDeCaracteres)}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barra de progreso y botones de preguntas */}
      {indiceActual !== null && !orientacion.orientacion && !load && (
        <>
          <div className="relative w-full my-5">
            {/* Barra de progreso */}
            <div className="h-1 bg-gray-300 rounded-full ">
              <motion.div
                initial={{ width: "0%" }}
                animate={{
                  width: `${((indiceActual + 1) / preguntas.length) * 100}%`,
                }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="h-1 bg-[#8276f4] rounded-full"
              ></motion.div>
            </div>
          </div>
          {/* Botones */}
          <div className="flex justify-between w-full mt-3">
            {indiceActual > 0 ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-[#8276f4] text-white rounded-full w-10 h-10 flex items-center justify-center"
                onClick={handleAnterior}
              >
                <FaChevronLeft />
              </motion.button>
            ) : (
              // Placeholder invisible con el mismo tamaño que el botón
              <div className="w-10 h-10"></div>
            )}

            {indiceActual === preguntas.length - 1 ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-[#8276f4] text-white rounded-[12px] text-sm font-medium flex items-center justify-center"
                onClick={handleOrientacion}
              >
                👨‍⚕️ Generar orientación
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-[#8276f4] text-white rounded-full w-10 h-10 flex items-center justify-center"
                onClick={handleSiguiente}
              >
                <FaChevronRight />
              </motion.button>
            )}
          </div>
        </>
      )}

      {/* Orientación completa */}
      {orientacion.orientacion && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.8,
            delay: 0.5,
            ease: [0, 0.71, 0.2, 1.01],
          }}
        >
          {/* Texto Justificado con tamaño máximo de w-80 */}
          <p className="text-gray-600 mb-5 text-sm text-center justify text-justify w-full mx-auto">
            {orientacion.orientacion}
          </p>

          {/* Resumen con palabras clave como chips */}
          <div className="mb-5 text-center w-full">
            <p className="text-gray-600 mb-2 text-md rounded-md p-1 font-medium">
              Resumen:
            </p>
            <div className="flex justify-center space-x-2 flex-wrap">
              {orientacion.palabrasclave.map((palabra, index) => (
                <span
                  key={index}
                  className="text-white capitalize bg-[#8276f4] border-[#8276f4] border rounded-full px-3 py-1 mb-1 text-sm whitespace-nowrap flex-shrink-0"
                >
                  {palabra}
                </span>
              ))}
            </div>
          </div>

          {/* Div con escala de urgencia y explicación */}
          <div className="bg-[#8276f4] border rounded-md border-[#8276f4] p-3 mx-auto w-full mb-4">
            {/* Círculos de escala de urgencia */}
            <p className="text-white mb-2 text-md rounded-md font-medium">
              Urgencia
            </p>
            <div className="flex mb-3">
              {[1, 2, 3, 4, 5].map((num) => (
                <div
                  key={num}
                  className={`w-3 h-3 rounded-full mr-2 ${
                    num <= orientacion.urgencia
                      ? "bg-white"
                      : "border border-white"
                  }`}
                ></div>
              ))}
            </div>
            <p className="text-white text-sm mb-1 text-justify">
              {orientacion.explicacionUrgencia}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center space-y-4 my-4 w-full">
            <div className="flex items-center space-x-2">
              <p className="text-gray-600 text-sm text-center w-full mx-auto mb-4">
                Gracias por confiar en mediko!
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-[#8276f4] text-white rounded-[12px] px-4 text-sm font-medium"
              onClick={handleReset}
            >
              🩺 Nueva orientación
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// https://js.langchain.com/docs/modules/chains/popular/structured_output
// https://python.langchain.com/docs/modules/chains/how_to/openai_functions#using-jsonschema
// https://replit.com/@yoyo-code/LangChain-Orientador-Mediko#src/App.tsx
// ngrok http XXXX
