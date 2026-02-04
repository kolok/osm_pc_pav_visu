SELECT DISTINCT
    a.identifiant_unique,
    a.nom,
    a.latitude,
    a.longitude,
    a.adresse,
    a.code_postal,
    a.ville
FROM base_vueacteur_visible a
-- Jointure avec les propositions de service
INNER JOIN base_propositionservice_visible ps ON ps.acteur_id = a.identifiant_unique
-- Jointure avec la table de liaison sous-catégories
INNER JOIN base_propositionservice_sous_categories_visible psc ON psc.vuepropositionservice_id = ps.id
-- Jointure avec les sous-catégories pour filtrer sur emballage_verre
INNER JOIN base_souscategorieobjet_visible sco ON sco.id = psc.souscategorieobjet_id
-- Jointure spatiale avec les communes
INNER JOIN clone_ca_commune_in_use AS c ON ST_Contains(
    c.c.contours_administratifs,
    ST_SetSRID(ST_MakePoint(a.longitude, a.latitude), 4326)
)
WHERE ps.action_id = 11  -- action trier
  AND a.acteur_type_id = 10 -- type d'acteur pav_public
  AND sco.code = 'emballage_verre'
  AND c.code_commune IN ('93001', '93031', '93039', '93027', '93059', '93066', '93070', '93072', '93079')
ORDER BY a.nom;