module.exports.messages = (status, description, error = null) => {
    if (error) {
        return { status: status, message: description }
    }else {
        return { status: status, message: description }
    }
}