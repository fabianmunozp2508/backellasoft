module.exports = (req, res, next) => {
  const tenantId = req.body.tenant_id || req.query.tenant_id || req.headers['tenant-id'];

  if (!tenantId) {
    console.log('No tenant specified');
    return res.status(400).send('No tenant specified');
  }

  req.tenant_id = tenantId;
  console.log('req.tenant_id:', req.tenant_id); // Verificar que el tenant_id está siendo asignado
  next();
};
