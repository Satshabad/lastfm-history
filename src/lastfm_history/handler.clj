(ns lastfm-history.handler
  (:use compojure.core)
  (:require [compojure.handler :as handler]
            [clojure.data.json :as json]
            [rate-gate.core :as rate-gate]
            [me.raynes.least :as least]
            [compojure.route :as route]))

(defn json-response [data & [status]]
  {:status (or status 200)
   :headers {"Content-Type" "application/json"}
   :body (json/write-str data)})

(defn get-weeks-of-month [weeks target]
  (reduce
    (fn [result four-weeks]
            (let [start (read-string ((first four-weeks) :from))
                  end (read-string ((last four-weeks) :to))]
              (if (and (> target start) (<= target end))
                (reduced four-weeks)
                result)))
    nil (partition-all 4 weeks)))

(defn weeklytracks [username from to]
  ((rate-gate/rate-limit
    (fn []
   (do (println "now here")
      (least/read
        "user.getWeeklyTrackChart"
        "a04a1b4812e56aa623ce55fc5a396cc6"
        {:user username :from from :to to})))
    5
    1000)))

(defn top-tracks-for-all-weeks [weeks, username]
  (for [week weeks]
    (let [start (read-string (week :from))
          end (read-string (week :to))]
      (weeklytracks username start end))))

(defn top-user-artists [username]
  (((least/read "user.getTopArtists"
               "a04a1b4812e56aa623ce55fc5a396cc6"
               {:user username}) :topartists)  :artist))

(defn merge-responses [responses]
  {:monthlytrackchart
   {:track
    (reduce concat []
      (map #(get-in % [:weeklytrackchart :track]) responses))}})

(defroutes api-routes
  (GET "/:username/toptracks" [username time-in-week]
       (let [weeks (((least/read
                       "user.getWeeklyChartList"
                       "a04a1b4812e56aa623ce55fc5a396cc6"
                       {:user username})
                     :weeklychartlist)
                    :chart )]

         (if-let [weeks-of-month (get-weeks-of-month weeks (Integer/parseInt time-in-week))]
           (json-response (merge-responses (top-tracks-for-all-weeks weeks-of-month username))))))
  (GET "/:username/topartist" [username]
       (json-response (let [top (top-user-artists username)]
         (top (rand-int (count top)))))))

(defroutes app-routes
  (context "/api" [] api-routes)
  (route/resources "/")
  (route/not-found "Not Found"))

(def app
  (handler/api app-routes))
