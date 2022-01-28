const app = require('./server')

const mongoos = require('mongoose')

mongoos.connect(process.env.DB_URI, { useNewUrlParser: true }).catch(err => {
    console.log("🚀 ~ file: index.js ~ line 6 ~ mongoos.connect ~ err", err)
    process.exit(1)
})
const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
    console.log("server listening to port", PORT);
})