const Center=require("../Models/centerSchema");

const bookingDetails = async (req, res)=>{
        let centerId = req.params.id;
        let center = await Center.findById(centerId);
        let data = center.booked;

        data.sort(sortFunction);
        function sortFunction(a, b) {
            let x=new Date(a[a.length-1]);
            let y=new Date(b[b.length-1]);
            if (x==y) {
              return 0;
            }
            else {
                return (x < y) ? -1 : 1;
            }
        }
        res.render("centerBookings", {center: data});
}

module.exports = bookingDetails;