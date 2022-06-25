const generateMessage = (username,text) => {
  return {
    username,
    text,
    createdAt: new Date().getTime(),
  };
};

const generateLoctionMessage = (username, coords) => {
  return {
    username,
    link: `https://google.com/maps?q=${coords.latitude},${coords.longitude}`,
    createdAt: new Date().getTime(),
  };
};

module.exports = {
  generateMessage,
  generateLoctionMessage,
};
