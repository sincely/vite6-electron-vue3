const errorHandler = function (error, event) {
  event.node.res.end(`[Error Handler] ${error.stack}`)
}

export default errorHandler
