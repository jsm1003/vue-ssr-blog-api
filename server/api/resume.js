const fs = require('fs')

module.exports = {
    getResume (req, res) {
        fs.readFile( 'server/static/resume.json', (err, data) => {
            if(err) console.log(err)
            // console.log(JSON.parse(data))
            res.json(JSON.parse(data))
        })
        // res.send('ok')
    }
}