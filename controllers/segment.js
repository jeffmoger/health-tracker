module.exports = {
    getSegment(req, res, next) {
      const segment = req.params.segment;
      res.locals.segment = segment;
      console.log('segment.js:' + res.locals.segment)
      next()
    }
  }