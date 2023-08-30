import { z } from "zod";
import { ChatOpenAI } from "langchain/chat_models/openai";
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from "langchain/prompts";
import { createStructuredOutputChainFromZod } from "langchain/chains/openai_functions";

export const crearPreguntas = async (texto: string) => {
  const llm = new ChatOpenAI({
    openAIApiKey: import.meta.env.VITE_OPENAI_APIKEY,
    modelName: "gpt-4-0613",
    temperature: 1,
  });

  const zodSchema = z.object({
    preguntas: z
      .array(
        z.object({
          pregunta: z
            .string()
            .describe("Una pregunta a partir del motivo de consulta"),
        })
      )
      .describe(
        "Un array de 7 preguntas a partir del motivo de consulta medica"
      ),
  });

  const prompt = new ChatPromptTemplate({
    promptMessages: [
      SystemMessagePromptTemplate.fromTemplate(
        "A partir del motivo de consulta médica, genera 7 preguntas clave y faciles de responder que ayuden a un médico a llegar a un diagnóstico adecuado."
      ),
      HumanMessagePromptTemplate.fromTemplate(
        "Motivo de consulta: {inputText}"
      ),
    ],
    inputVariables: ["inputText"],
  });

  const chain = createStructuredOutputChainFromZod(zodSchema, {
    prompt,
    llm,
    outputKey: "respuesta",
  });
  const res = await chain.call({ inputText: texto });
  return res.respuesta.preguntas;
};

export const crearOrientacion = async (
  motivo: string,
  cuestionario: string
) => {
  const llm = new ChatOpenAI({
    openAIApiKey: import.meta.env.VITE_OPENAI_APIKEY,
    modelName: "gpt-4-0613",
    temperature: 0.7,
  });

  const zodSchema = z.object({
    orientacion: z.string().describe("String con la orientacion medica."),
    urgencia: z
      .number()
      .describe(
        "Valor numerico del nivel de urgencia del problema medico en una escala del 1 al 5, donde 1 no debe ir al medico, 2 tal vez deba ir, 3 debe ir sin urgencia, 4 debe ir si o si y 5 debe ir de inmediato"
      ),
    explicacionUrgencia: z
      .string()
      .describe(
        "String con una breve explicacion del por qué se asigno el nivel de urgencia"
      ),
    palabrasclave: z
      .array(z.string())
      .describe(
        "Array con 3 palabras clave los posibles diagnosticos del paciente"
      ),
  });

  const prompt = new ChatPromptTemplate({
    promptMessages: [
      SystemMessagePromptTemplate.fromTemplate(
        "Eres un asistente médico virtual que entrega orientacion médica completa, consisa, con lenguaje profesional proporcionando recomendacion a seguir de acuerdo con los síntomas informados y explicando lo que podría pasar en la consulta médica con el profesional y los diagnosticos mas probables, además utilizas algunos emojis para representar ciertos conceptos de manera didactica y al final simpre mencionas de manera creativa a Mediko, una aplicacion web donde puedes obtener ordenes de exámenes, interpretación de examenes y atención médica online de manera rapida y de calidad."
      ),
      HumanMessagePromptTemplate.fromTemplate(
        "A partir de este motivo de consulta médica {motivo}, y este cuestionario medico {cuestionario}, necesito que elabores una orientación médica."
      ),
    ],
    inputVariables: ["motivo", "cuestionario"],
  });

  const chain = createStructuredOutputChainFromZod(zodSchema, {
    prompt,
    llm,
    outputKey: "orientacion",
  });
  const res = await chain.call({ motivo: motivo, cuestionario: cuestionario });
  return res.orientacion;
};
