const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 500;

    console.log(err.message);

    // res.status(statusCode).json();

    // return res.status(statusCode).send({ status: statusCode, message: err.message });

    res.status(statusCode);
    res.statusText(err.message);

};


// const jsonErrorHandler = (err, req, res, next) => {
//     res.status(500).send({ error: err });
//   }

module.exports = { errorHandler }