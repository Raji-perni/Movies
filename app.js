const express = require("express");
const app = express();
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const databasePath = path.join(__dirname, "moviesData.db");

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    movieName: dbObject.movie_name,
    directorId: dbObject.director_id,
    leadActor: dbObject.lead_actor,
    directorName: dbObject.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie;`;
  const moviesArray = await database.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `
    SELECT
      *
    FROM
      director;`;
  const directorArray = await database.all(getDirectorQuery);
  response.send(
    directorArray.map((eachDirector) =>
      convertDbObjectToResponseObject(eachDirector)
    )
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const getDirectorQuery = `
    SELECT
      movie_name
    FROM
      movie
    WHERE 
      director_id = 4;`;
  const directorArray = await database.all(getDirectorQuery);
  response.send(
    directorArray.map((eachDirector) =>
      convertDbObjectToResponseObject(eachDirector)
    )
  );
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT 
      * 
    FROM 
      movie
    WHERE 
      movie_id = ${movieId};`;
  const movie = await database.get(getMovieQuery);
  response.send(convertDbObjectToResponseObject(movie));
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovieQuery = `
  INSERT INTO
    movie (director_id, movie_name,  lead_actor)
  VALUES
    ('${directorId}', '${movieName}', '${leadActor}');`;

  const movie = await database.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieName, directorId, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMoviesQuery = `
  UPDATE
    movie
  SET
    director_id = '${directorId}',
    movie_name = '${movieName}',  
    lead_actor = '${leadActor}'
  WHERE
    movie_id = ${movieId};`;

  const movie = await database.run(updateMoviesQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMoviesQuery = `
  DELETE FROM
    movie
  WHERE
    movie_id = ${movieId};`;
  const movie = await database.run(deleteMoviesQuery);
  response.send("Movie Removed");
});

module.exports = app;
