import { initTranslation, load } from "i18n";

const ru = {
  hello: "Hello",
};

load("ru", ru);

export const t = (key: keyof typeof ru) => {
  const translation = initTranslation<typeof ru>();
  return translation("ru", key) || "Locale error";
};
