export const ok = (message, data, status = 200) => ({
    message,
    data,
    status
})

export const fail = (message, data = {}, status = 400) => ({
    message,
    data,
    status
})