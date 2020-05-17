const axios = require('axios');

const {
    GraphQLObjectType, 
    GraphQLString,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull
} = require('graphql');

//Hardcoded test data
// const customers = [
//     {id: '1', name: 'Sakamoto', email: 'Sakamoto@tama.com', age: 29 },
//     {id: '2', name: 'Katsura', email: 'Katsura@tama.com', age: 33 },
//     {id: '3', name: 'Gintoki', email: 'Gintoki@tama.com', age: 35 }
// ];
// ** NOW REFERS TO DATA.JSON 

//CustomerType 
const CustomerType = new GraphQLObjectType({
    name: 'Customer',
    fields: () => ({
        id: {type:GraphQLString},
        name: {type:GraphQLString},
        email: {type:GraphQLString},
        age: {type: GraphQLInt}, 
        hair_colour: {type: GraphQLString},
        eye_colour: {type: GraphQLString}
    })
});

//Root Query
const rootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        //return a specific customer based on the id of the customer
        customer:{
            type:CustomerType,
            args: {
                id: {type: GraphQLString}
            },
            resolve(parentValue, args){

                //if using hard-coded data above;
                // for(let i = 0; i < customers.length; i++){
                //     if(customers[i].id === args.id){
                //         return customers[i];
                //     }
                // }

                //if using data from data.json:
                return axios.get(`http://localhost:3000/customers/${args.id}`)
                .then((res) => res.data);
            }
        },
        //return all customers, by creating a new variable that accepts no args
        //this is useful for returning the entire list, and the above root query would be better suited to returning a subset of the
        //total list, but maybe using a filter
        customers: {
            type: new GraphQLList(CustomerType),
            resolve(parentValue, args){
                //return customers

                return axios.get(`http://localhost:3000/customers`)
                .then((res) => res.data);
            }
        }
    }
});

//Mutations
const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addCustomer:{
            type: CustomerType,
            args: {
                name: {type: new GraphQLNonNull(GraphQLString)},
                age: {type: new GraphQLNonNull(GraphQLString)},
                email: {type: new GraphQLNonNull(GraphQLString)},
                hair_colour: {type: new GraphQLNonNull(GraphQLString)},
                eye_colour: {type: new GraphQLNonNull(GraphQLString)} //makes it a required field, can't be null
            },
            resolve(parentValue, args){
                return axios.post('http://localhost:3000/customers', {
                    name: args.name,
                    email: args.email,
                    age: args.age,
                    hair_colour: args.hair_colour,
                    eye_colour: args.eye_colour
                })
                .then(res => res.data);
            }
        }, 

        deleteCustomer:{
            type: CustomerType,
            args:{
                id: {type: new GraphQLNonNull(GraphQLString)}
            },
            resolve(parentValue, args){
                return axios.delete(`http://localhost:3000/customers/${args.id}`)
                .then(res => res.data);
            }
        }, 

        editCustomer:{
            type: CustomerType,
            args: {
                id: {type: new GraphQLNonNull(GraphQLString)},
                name: {type: GraphQLString},
                age: {type: GraphQLInt},
                email: {type: GraphQLString},
                hair_colour: {type: GraphQLString},
                eye_colour: {type: GraphQLString} //makes it a required field, can't be null
            },
            resolve(parentValue, args){
                return axios.patch(`http://localhost:3000/customers/${args.id}`, args)
                .then(res => res.data);
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: rootQuery, mutation
});