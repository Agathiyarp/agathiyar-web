package main

import (
	"time"

	"github.com/gorilla/sessions"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

var (
	client *mongo.Client
	store  = sessions.NewCookieStore([]byte("super-secret-key"))
)

type EventRegistration struct {
	EventID         string `json:"eventid" bson:"eventid"`
	MemberID        string `json:"memberid" bson:"memberid"`
	Register        bool   `json:"register" bson:"register"`
	Guests          string `json:"guests" bson:"guests"` // or int if numeric
	StartDate       string `json:"startdate" bson:"startdate"`
	EndDate         string `json:"enddate" bson:"enddate"`
	EventName       string `json:"eventname" bson:"eventname"`
	EventMasterName string `json:"eventmastername" bson:"eventmastername"`
	EventTime       string `json:"eventtime" bson:"eventtime"`
	EventDays       string `json:"eventdays" bson:"eventdays"` // or int if numeric
	EventPlace      string `json:"eventplace" bson:"eventplace"`
	Contact         string `json:"contact" bson:"contact"`
	Name            string `json:"name" bson:"name"`
	Email           string `json:"email" bson:"email"`
	UserType        string `json:"usertype" bson:"usertype"`
}

type RegisterUser struct {
	Name            string    `json:"name"`
	Email           string    `json:"email"`
	PhoneNumber     string    `json:"phoneNumber"`
	Country         string    `json:"country"`
	Username        string    `json:"username"`
	UserMemberID    string    `json:"usermemberid"`
	Password        string    `json:"password"`
	ConfirmPassword string    `json:"confirmPassword"`
	UserType        string    `json:"usertype"`
	UserRole        string    `json:"userrole"` // new field
	ProfileImage    string    `json:"profileImage"`
	Address         string    `json:"address"`
	DateOfBirth     string    `json:"dob"`
	Gender          string    `json:"gender"`
	Createddate     time.Time `json:"createddate"`
	UserAccess      []string  `json:"useraccess" bson:"useraccess"`
	Credits         int       `json:"credits"`

	// New fields without omitempty
	CreditModifyDate    *time.Time    `json:"creditmodifiedate" bson:"creditmodifiedate"`
	UserTypeModifyDate  *time.Time    `json:"usertypemodifiedate" bson:"usertypemodifiedate"`
	AgathiyarRoom       int           `json:"agathiyarroom" bson:"agathiyarroom"`
	PathrijiRoom        int           `json:"pathrijiroom" bson:"pathrijiroom"`
	DormitoryRoom       int           `json:"dormitoryroom" bson:"dormitoryroom"`
	TotalRoomAvailed    int           `json:"totalroomavailed" bson:"totalroomavailed"`
	UserTotalDaysBooked int           `json:"usertotaldaysbooked" bson:"usertotaldaysbooked"`
	CreditModifyReason  string        `json:"creditmodifyreason,omitempty"`
	UserHistory         []UserHistory `bson:"userHistory" json:"userHistory"`
}

type LoginResponse struct {
	Username     string   `json:"username"`
	UserMemberID string   `json:"usermemberid"`
	UserType     string   `json:"usertype"`
	UserRole     string   `json:"userrole"` // new field
	UserImage    string   `json:"profileImage"`
	UserPhone    string   `json:"phoneNumber"`
	UserEmail    string   `json:"email"`
	Gender       string   `json:"gender"`
	UserAccess   []string `json:"useraccess"`
	Credits      int      `json:"credits"`

	// New fields without omitempty
	CreditModifyDate    *time.Time `json:"creditmodifiedate"`
	UserTypeModifyDate  *time.Time `json:"usertypemodifiedate"`
	AgathiyarRoom       int        `json:"agathiyarroom"`
	PathrijiRoom        int        `json:"pathrijiroom"`
	DormitoryRoom       int        `json:"dormitoryroom"`
	RoomLimit           int        `json:"roomlimit"`
	TotalRoomAvailed    int        `json:"totalroomavailed"`
	UserTotalDaysBooked int        `json:"usertotaldaysbooked"`
}

type Response struct {
	Message string `json:"message"`
}

type AllUserResponse struct {
	Name                string        `json:"name"`
	Email               string        `json:"email"`
	PhoneNumber         string        `json:"phoneNumber"`
	Country             string        `json:"country"`
	Username            string        `json:"username"`
	UserMemberID        string        `json:"usermemberid"`
	UserRole            string        `json:"userrole"`
	UserType            string        `json:"usertype"`
	Address             string        `json:"address"`
	DateOfBirth         string        `json:"dateofbirth"`
	Gender              string        `json:"gender"`
	UserAccess          []string      `json:"useraccess"`
	Createddate         time.Time     `json:"createddate"`
	CreditModifyDate    *time.Time    `json:"creditmodifiedate"`
	UserTypeModifyDate  *time.Time    `json:"usertypemodifiedate"`
	AgathiyarRoom       int           `json:"agathiyarroom"`
	PathrijiRoom        int           `json:"pathrijiroom"`
	DormitoryRoom       int           `json:"dormitoryroom"`
	CreditUsed          int           `json:"credits"`
	TotalRoomAvailed    int           `json:"totalroomavailed"`
	UserTotalDaysBooked int           `json:"usertotaldaysbooked"`
	CreditModifyReason  string        `json:"creditmodifyreason,omitempty"`
	Password            string        `json:"password"`
	UserHistory         []UserHistory `bson:"userHistory" json:"userHistory"`
}

type EventRegisterUser struct {
	EventName    string `json:"eventname"`
	Name         string `json:"name"`
	Email        string `json:"email"`
	PhoneNumber  string `json:"phoneNumber"`
	Country      string `json:"country"`
	Username     string `json:"username"`
	Destination  string `json:"destination"`
	RoomType     string `json:"roomtype"`
	CheckIn      string `json:"checkin"`
	CheckOut     string `json:"checkout"`
	Amount       string `json:"amount"`
	MemberCount  string `json:"membercount"`
	NumberOfDays string `json:"numberofdays"`
}

type EventAdd struct {
	EventID              primitive.ObjectID `json:"eventid,omitempty" bson:"_id,omitempty"`
	EventName            string             `json:"eventname" bson:"eventname"`
	MasterName           string             `json:"mastername" bson:"mastername"`
	StartDate            string             `json:"startdate" bson:"startdate"`
	EndDate              string             `json:"enddate" bson:"enddate"`
	NumberOfDays         string             `json:"numberofdays" bson:"numberofdays"`
	EventDescription     string             `json:"eventdescription" bson:"eventdescription"`
	Place                string             `json:"place" bson:"place"` // changed from Destination
	RoomType             string             `json:"roomtype" bson:"roomtype"`
	NumberOfParticipants string             `json:"numberofparticipants" bson:"numberofparticipants"`
	RetreatCost          string             `json:"retreatcost" bson:"retreatcost"`
	ReserveDeposit       string             `json:"reservedeposit" bson:"reservedeposit"`
	ContactDetails       string             `json:"contactdetails" bson:"contactdetails"`
	Image                string             `json:"imageurl" bson:"imageurl"`
	Language             string             `json:"language" bson:"language"`
}

type BookingAdd struct {
	ID                         primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	RoomName                   string             `json:"roomname" bson:"roomname"`
	SingleOccupy               string             `json:"singleoccupy" bson:"singleoccupy"`
	RoomDescription            string             `json:"roomdescription" bson:"roomdescription"`
	RoomType                   string             `json:"roomtype" bson:"roomtype"`
	AvailableTotalRooms        int                `json:"availabletotalrooms" bson:"availabletotalrooms"`
	RoomVariation              string             `json:"roomvariation" bson:"roomvariation"`
	SponsorUserRoomCost        int                `json:"sponsoruserroomcost" bson:"sponsoruserroomcost"`
	NormalUserRoomCost         int                `json:"normaluserroomcost" bson:"normaluserroomcost"`
	NormalUserMaintenanceCost  int                `json:"normalusermaintenancecost" bson:"normalusermaintenancecost"`
	SponsorUserMaintenanceCost int                `json:"sponsorusermaintenancecost" bson:"sponsorusermaintenancecost"`
	MaxRoomAllowed             int                `json:"maxroomallowed" bson:"maxroomallowed"`
	ExtraBed                   string             `json:"extrabed" bson:"extrabed"`
	ExtraBedCost               int                `json:"extrabedcost" bson:"extrabedcost"`
	UserRoomLimit              int                `json:"userroomlimit" bson:"userroomlimit"`
	MaintenanceAlert           string             `json:"maintenancealert" bson:"maintenancealert"`
	CreatedDate                time.Time          `json:"createddate" bson:"createddate"`
	ModifiedDate               time.Time          `json:"modifieddate" bson:"modifieddate"`
	SingleImage                string             `json:"image" bson:"image"`
	MultipleImage              []string           `json:"multipleimage" bson:"multipleimage"`
}

type BookingSummary struct {
	ID                  primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	MemberId            string             `json:"memberid"`
	Email               string             `json:"email"`
	UserName            string             `json:"username"`
	RoomId              string             `json:"roomid"` // Changed from int to string
	Destination         string             `json:"roomname"`
	StartDate           time.Time          `json:"startdate"`
	EndDate             time.Time          `json:"enddate"`
	CreatedDate         time.Time          `json:"createddate" bson:"createddate"`
	ModifiedDate        time.Time          `json:"modifieddate" bson:"modifieddate"`
	SingleOccupy        string             `json:"singleoccupy"`
	RoomDescription     string             `json:"roomdescription" bson:"roomdescription"`
	RoomType            string             `json:"roomtype"`
	RoomVariation       string             `json:"roomvariation"`
	RoomCost            int                `json:"roomcost,string"` // string in JSON, parsed as int
	TotalRoomsBooked    int                `json:"totalroomsbooked,omitempty"`
	MaintenanceCost     int                `json:"maintanancecost,omitempty"`
	TotalAmount         int                `json:"totalamount,omitempty"`
	CreditUsed          int                `json:"creditused,omitempty"`
	ExtraBedBooked      int                `json:"extrabedbooked,omitempty"`
	BookingStatus       string             `json:"bookingstatus,omitempty"`
	UserType            string             `json:"usertype"`
	ValidDays           []string           `json:"validDays"`
	BookingCancelReason string             `json:"bookingcancelreason"`
}

type RoomAvailability struct {
	ID          primitive.ObjectID `bson:"_id,omitempty"`
	Date        string             `bson:"date"`
	RoomType    string             `bson:"roomtype"`
	Destination string             `bson:"destination"`
	TotalBooked int                `bson:"totalbooked"`
}

type CommonData struct {
	UpdateUserID           string `json:"updateuserid"`
	AgathiyarAvailableRoom string `json:"agathiyaravailableroom"`
	PathrijiAvailableRoom  string `json:"pathirijiavailableroom"`
	DormitoryAvailableRoom string `json:"dormitoryavailableroom"`
}

// Video represents video information
type Video struct {
	ID   primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name string             `json:"name"`
	Link string             `json:"link"`
}

type Book struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	FileName     string             `json:"filename" bson:"filename"`
	FilePath     string             `json:"filepath" bson:"filepath"`
	CoverImgPath string             `json:"coverimgpath,omitempty" bson:"coverimgpath,omitempty"`
}

type Credits struct {
	ID      primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Donar   int                `bson:"donar" json:"donar"`
	Sponsor int                `bson:"sponsor" json:"sponsor"`
	Patron  int                `bson:"patron" json:"patron"`
}

type Schedule struct {
	StartDate   string `json:"startDate"`
	EndDate     string `json:"endDate"`
	Enable      string `json:"enable"`
	CreatedDate string `json:"createdDate"` // now comes from client
}
type Scheduleupdate struct {
	ID          string `json:"_id"` // client sends this as string
	StartDate   string `json:"startDate"`
	EndDate     string `json:"endDate"`
	Enable      string `json:"enable"`
	CreatedDate string `json:"createdDate"`
}

type DeleteRequest struct {
	ID string `json:"id"`
}

type RoomBooking struct {
	RoomType         string `bson:"roomtype" json:"roomtype"`
	TotalDaysBooked  int    `bson:"totaldaysbooked" json:"totaldaysbooked"`
	TotalRoomAvailed int    `bson:"totalroomavailed" json:"totalroomavailed"`
}

type BookingData struct {
	Destination  string                    `bson:"destination" json:"destination"`
	MemberID     string                    `bson:"memberid" json:"memberid"`
	CreatedDate  time.Time                 `bson:"createddate" json:"createddate"`
	RoomBookings map[string]map[string]int `bson:"roombookings" json:"roombookings"` // handles agathiyar: {date: count}
	RoomType     string                    `bson:"roomtype" json:"roomtype"`
	TotalDays    int                       `bson:"totaldaysbooked" json:"totaldaysbooked"`
	TotalRoom    int                       `bson:"totalroomavailed" json:"totalroomavailed"`
	Username     string                    `bson:"username" json:"username"`
}
type GalleryItem struct {
	ID       primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name     string             `bson:"name" json:"name"`
	FileName string             `bson:"filename" json:"filename"`
	FilePath string             `bson:"filepath" json:"filepath"`
	UploadAt time.Time          `bson:"uploadAt" json:"uploadAt"`
}

type HomeGalleryItem struct {
	ID       primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name     string             `bson:"name" json:"name"`
	Section  string             `bson:"section" json:"section"`
	FileName string             `bson:"filename" json:"filename"`
	FilePath string             `bson:"filepath" json:"filepath"`
	UploadAt time.Time          `bson:"uploadAt" json:"uploadAt"`
}

type DailyRoomEntry struct {
	Date      string `json:"date"`
	Agathiyar int    `json:"agathiyar"`
	Patriji   int    `json:"patriji"`
	Dormitory int    `json:"dormitory"`
}

type BookingManualSummary struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	FullName  string             `bson:"name" json:"name"`
	Age       string             `bson:"age" json:"age"`
	Gender    string             `bson:"gender" json:"gender"`
	RoomName  string             `bson:"roomname" json:"roomname"`
	Phone     string             `bson:"phone" json:"phone"`
	Email     string             `bson:"email" json:"email"`
	StartDate time.Time          `bson:"startdate" json:"startdate"`
	EndDate   time.Time          `bson:"enddate" json:"enddate"`
	Address   string             `bson:"address" json:"address"`

	// system fields
	BookingStatus string    `bson:"bookingstatus" json:"bookingstatus"`
	CreatedDate   time.Time `bson:"createddate" json:"createddate"`
}

// Add this struct definition
type UserHistory struct {
	Credits int       `json:"credits" bson:"credits"`
	Date    time.Time `json:"date" bson:"date"`
	Reason  string    `json:"reason" bson:"reason"`
}
