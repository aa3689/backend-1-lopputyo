// Schema tarvitaan, jotta GraphQL osaa käsitellä pyyntöjä

const graphql = require('graphql');
const Student = require('../models/Student.js');
const Grade = require('../models/Grade.js');

// Otetaan graphql-paketista muuttujia/funktioita käytettäväksi
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
} = graphql;

// OBJEKTITYYPIT
// käytännössä GraphQL:n schema eli kertoo
// GraphQL:lle minkä muotoista dataa käsitellään
const StudentType = new GraphQLObjectType({
  name: 'Student',
  fields: () => ({
    id: { type: GraphQLID },
    studentcode: { type: GraphQLString },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    studypoints: { type: GraphQLInt },
    grades: {
      type: new GraphQLList(GradeType),
      resolve(parent, args) {
        return Grade.find({ studentId: parent.id });
      },
    },
  }),
});

const GradeType = new GraphQLObjectType({
  name: 'Grade',
  fields: () => ({
    id: { type: GraphQLID },
    studentId: { type: GraphQLString },
    coursecode: { type: GraphQLString },
    grade: { type: GraphQLInt },
    student: {
      type: StudentType,
      resolve(parent, args) {
        return Student.findById(parent.studentId);
      },
    },
  }),
});

// HAUT
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    // opiskelijan haku id:n perusteella
    student: {
      type: StudentType,
      args: { id: { type: GraphQLID } },
      // resolve vastaa pyynnön datan hakemisesta
      resolve(parent, args) {
        return Student.findOne({ _id: args.id });
      },
    },
    // opiskelijan haku nimellä
    studentByName: {
      type: StudentType,
      args: { name: { type: GraphQLString } },
      resolve(parent, args) {
        return Student.findOne({ name: args.name });
      },
    },
    // kaikkien opiskelijoiden haku
    students: {
      type: new GraphQLList(StudentType),
      resolve(parent, args) {
        return Student.find({});
      },
    },
    // niiden opiskelijoiden haku, joilla on alle haussa määritellyn verran opintopisteitä
    studentsByPoints: {
      type: new GraphQLList(StudentType),
      args: { studypoints: { type: GraphQLInt } },
      resolve(parent, args) {
        return Student.find({ studypoints: { $lt: args.studypoints } });
      },
    },
    // arvosanojen haku opiskelijan id:llä
    grade: {
      type: new GraphQLList(GradeType),
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return Grade.find({ studentId: args.id });
      },
    },
    // kaikkien arvosanojen haku
    grades: {
      type: new GraphQLList(GradeType),
      resolve(parent, args) {
        return Grade.find({});
      },
    },
    // niiden opiskelijoiden haku joilla on tietty kurssi
    studentsByCoursecode: {
      type: new GraphQLList(GradeType),
      args: { coursecode: { type: GraphQLString } },
      resolve(parent, args) {
        return Grade.find({ coursecode: args.coursecode });
      },
    },
  },
});

// MUTAATIOT (datan lisäys, muokkaus, poisto)
const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    // opiskelijan lisäys
    addStudent: {
      type: StudentType,
      args: {
        studentcode: { type: GraphQLString },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        studypoints: { type: GraphQLInt },
      },
      resolve(parent, args) {
        const student = new Student({
          studentcode: args.studentcode,
          name: args.name,
          email: args.email,
          studypoints: args.studypoints,
        });
        return student.save(); // tallennetaan tietokantaan, collection selviää modelista ('Student')
      },
    },
    // opiskelijan poisto id:n perusteella
    deleteStudent: {
      type: StudentType,
      args: {
        id: { type: GraphQLID },
      },
      resolve(parent, args) {
        return Student.findByIdAndDelete({ _id: args.id });
      },
    },
    // opiskelijan kaikkien kurssien poisto opiskelijan id:n perusteella
    /*
    Poistaminen toimii, mutta graphql alauttaa null. Sanoo ettei
    deleteGrade ole iterable vaikka sen pitäisi olla. En ymmärrä
    mistä  on kiinni, ei toimi myöskään 'type: GradeType' -muodossa.
    */
    deleteGrade: {
      type: new GraphQLList(GradeType),
      args: {
        studentId: { type: GraphQLID },
      },
      resolve(parent, args) {
        return Grade.deleteMany({ studentId: args.studentId });
      },
    },
    // opiskelijan tietojen muokkaus
    updateStudent: {
      type: StudentType,
      args: {
        id: { type: GraphQLID },
        studentcode: { type: GraphQLString },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        studypoints: { type: GraphQLInt },
      },
      resolve(parent, args) {
        return Student.findByIdAndUpdate(
          { _id: args.id },
          {
            $set: {
              studentcode: args.studentcode,
              name: args.name,
              email: args.email,
              studypoints: args.studypoints,
            },
          }
        );
      },
    },
    // arvosanan lisäys
    addGrade: {
      type: GradeType,
      args: {
        studentId: { type: GraphQLString },
        coursecode: { type: GraphQLString },
        grade: { type: GraphQLInt },
      },
      resolve(parent, args) {
        const grade = new Grade({
          studentId: args.studentId,
          coursecode: args.coursecode,
          grade: args.grade,
        });
        return grade.save();
      },
    },
  },
});

// Exportataan schema ja määritetään mitä queryja käyttäjä voi käyttää
module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
