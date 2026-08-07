module.exports = {
  GET: async (req, res) => {
    res.json({
      status: 'ok',
      service: 'Aegisky Medusa API',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    })
  }
}
