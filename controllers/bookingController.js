import prisma from '../models/prisma.js';

function getTimeSlot(timeString) {
    console.log("getTimeSlot", timeString);
    const [hours, minutes] = timeString.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes;

    console.log("hours, minutes", hours, minutes, totalMinutes);

    const firstHalfStart = 9 * 60;   // 9:00 AM = 540 minutess
    const firstHalfEnd = 13 * 60;    // 1:00 PM = 780 minutes

    const secondHalfStart = 13 * 60; // 1:00 PM = 780 minutes
    const secondHalfEnd = 18 * 60;   // 6:00 PM = 1080 minutes

    if (totalMinutes >= firstHalfStart && totalMinutes < firstHalfEnd) {
        return "First Half";
    } else if (totalMinutes >= secondHalfStart && totalMinutes < secondHalfEnd) {
        return "Second Half";
    }
}


function convertToISO(dateStr, timeStr) {
    // Combine date and time into a single string
    const dateTimeStr = `${dateStr}T${timeStr}:00.000Z`;

    // Convert to a Date object and return ISO string
    return new Date(dateTimeStr).toISOString();
}

// Create Booking
export const createBooking = async (req, res) => {
    let { customerName, customerEmail, bookingDate, bookingType, bookingSlot, bookingTime } = req.body;

    try {


        if (bookingType == 'Custom') {
            // To get slote type information based on timing
            bookingSlot = getTimeSlot(bookingTime);
            bookingTime = convertToISO(bookingDate, bookingTime);
            console.log("bookingDate, bookingTime", bookingDate, bookingTime, bookingSlot);
        }

        let query = { bookingType: 'Custom', bookingSlot };

        // To handle custom booking type with full day booking
        if (bookingType == 'Full Day') {
            query = { bookingType: 'Custom' };
        }

        bookingTime = bookingTime || null;
        const existingBooking = await prisma.booking.findFirst({
            where: {
                bookingDate: new Date(bookingDate).toISOString(),
                OR: [
                    { bookingType: 'Full Day' },
                    { bookingType: 'Half Day', bookingSlot },
                    query
                ]
            }
        });


        if (existingBooking) {
            return res.status(400).json({ message: 'Booking conflict detected!' });
        }


        const booking = await prisma.booking.create({
            data: { customerName, customerEmail, bookingDate: new Date(bookingDate).toISOString(), bookingType, bookingSlot, bookingTime, userId: req.user.id, }
        });

        res.json(booking);
    } catch (err) {
        console.log('err', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get All Bookings
export const getBookings = async (req, res) => {
    try {

        const bookings = await prisma.booking.findMany({ where: { userId: req.user.id }, orderBy: { bookingDate: 'desc' } });
        res.json(bookings);
    } catch (err) {
        console.log('err', err);

        res.status(500).json({ error: 'Server error' });
    }
};
