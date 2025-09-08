export const maskEmail = (emailLike: string) => {
  const [name, domain] = emailLike.split("@");
  if (!domain || name.length === 0) return emailLike.replace(/.(?=.{2})/g, "");
  const maskedName =
    name.length <= 2
      ? name[0] + "*"
      : name[0] + "*".repeat(Math.max(1, name.length - 2)) + name[name.length - 1];
  const [d1, ...rest] = domain.split(".");
  const maskedD1 =
    d1.length <= 2
      ? d1[0] + "*"
      : d1[0] + "*".repeat(Math.max(1, d1.length - 2)) + d1[d1.length - 1];
  return `${maskedName}@${maskedD1}${rest.length ? "." + rest.join(".") : ""}`;
};