# **Database Solutions**

This folder will help you demoing basic Relational DB Service with [**Aurora Cluster**](https://aws.amazon.com/rds/aurora) and NON Relational with [**DynamoDB**](https://aws.amazon.com/dynamodb)

## **Content**
This repo will create for this module
### **Aurora Stack**
- An **Aurora MYSQL** cluster with one writer and one reader instance.
- The cluster is attached to the `demo-vpc` with a security group allowing `priv-sg` to reach it on port 3306
- Credentials to access the clister are
    - **user: `demo`**
    - **password: `password1234`**

To test/demo this cluster, connect to the `priv-ec2` from [Module 3](../mod03-networking1/README.md) via SSM and run 
```bash
mysql -h <AURORA_ENDPOINT> -u demo -p # And digit password when prompted
```

### **DynamoDB Stack**
- A **DynamoDB** Table called `Employee` with some items  

| LoginAlias | ManagerLoginAlias | FirstName | LastName | Skills                                      |
|------------|-------------------|-----------|----------|---------------------------------------------|
| diegor     | johns             | Diego     | Ramirez  | ["test skill 1"]                            |
| diegor     | ben               | Zin       | Ramirez  | ["test skill2","another skill you didn't know"] |
| diegor     | johns2            | Conan     | Ramirez  | ["executive assistant"]                     |
| diegor     | zhoan             | Aldo      | Ramirez  | ["executive assistant"]                     |
| mateoj     | marthar           | Mateo     | Jackson  | ["software"]                                |
| marym      | johns             | Mary      | Major    | ["operations"]                              |
| johns      | NA                | John      | Stiles   | ["executive management"]                    |
| janer      | marthar           | Jane      | Roe      | ["software"]                                |
| janed      | marthar           | Jane      | Doe      | ["software"]                                |
| marthar    | johns             | Martha    | Rivera   | ["management","software"]                   |  

The table has `LoginAlias` as Partition Key and `ManagerLoginAlias` as Sort Key.    
There is also a *Local Secondary Index* on field **FirstName**  

To test/demo this table is possible to explore it directly from the AWS Console OR from the `priv-ec2` from [Module 3](../mod03-networking1/README.md) via SSM.  
The VM has the `aws` cli installed and a **role** with *DynamoDBFullAccess*.  

Some example scripts can be find in **[`cli-test` folder](./dynamo/cli-test/)**