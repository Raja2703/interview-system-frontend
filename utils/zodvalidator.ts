const zodFieldValidator = (schema: any) => ({ value }: any) => {
  const result = schema.safeParse(value);
  return result.success ? undefined : result.error.issues[0].message;
};

export default zodFieldValidator