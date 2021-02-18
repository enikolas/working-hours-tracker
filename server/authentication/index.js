require('dotenv').config();

const HEADER_REGEX = /Bearer (.*)$/;

exports.authenticate = ({ req }) => {
  const authorization = req.headers.authorization || '';
	const authorizationHeader = HEADER_REGEX.exec(authorization);

	if (!authorizationHeader) {
		return null;
	}

	const token = authorizationHeader[1];

	return token;
};
