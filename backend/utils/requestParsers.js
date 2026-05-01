const OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/;

const isValidObjectId = (id) => Boolean(id && OBJECT_ID_PATTERN.test(id));

const parseBoolean = (value) => value === "true" || value === true;

const parsePinnedFilter = (value) => {
  if (value === undefined) return undefined;
  return value === "true";
};

const parsePage = (page) => parseInt(page);

module.exports = {
  isValidObjectId,
  parseBoolean,
  parsePage,
  parsePinnedFilter,
};
