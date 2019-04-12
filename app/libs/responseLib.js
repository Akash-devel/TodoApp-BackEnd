let generate = (err, message, status, data) => {

    let response = {
        error: err,
        mesaage: message,
        status: status,
        data: data
    }

    return response;
} // end generate

module.exports = {
    generate: generate
}