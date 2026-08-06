const reqLogger = async (req, res, next) => {
    const { method, url, ip } = req;
    console.log(`[request logger] ${ip} ${method} ${url}`);
    next();
}
export default reqLogger;