function accessTokenData(userData) {
  const { _id, boards, email, name } = userData;
  const storeTokenData = { id: _id, boards, email, name };
  return storeTokenData;
}

module.exports = accessTokenData;
