<?php

/**
 * @file
 * Definition of Drupal\dol_dexi\Plugin\rest\resource\NodeSchemaAllResource.
 */

namespace Drupal\dol_dexi\Plugin\rest\resource;

use Drupal\Core\Entity\EntityManagerInterface;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Drupal\Core\Session\AccountProxyInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Psr\Log\LoggerInterface;
use Drupal\Component\Serialization\Json;
/**
 * Provides a resource to get bundles by entity.
 *
 * @RestResource(
 *   id = "dol_dexi",
 *   label = @Translation("Dexi Rest API"),
 *   uri_paths = {
 *     "canonical" = "api/v1/dol_dexi"
 *   }
 * )
 */
class DEXIRest extends ResourceBase {

    /**
     *  A current user instance.
     *
     * @var \Drupal\Core\Session\AccountProxyInterface
     */

    protected $currentUser;

    /**
     *  A instance of entity manager.
     *
     * @var \Drupal\Core\Entity\EntityManagerInterface
     */

    protected $entityManager;

    /*
     * Responds to GET requests.
     *   *
     * @return \Drupal\rest\ResourceResponse
     *   The response....
     *
     * @throws \Symfony\Component\HttpKernel\Exception\HttpException
     */
    public function get($entity = NULL) {
        $returnableArray = [];
        $params = \Drupal::request()->query;
        $elastic_sort = $params->get("sortBy");
        $elastic_agency = $params->get("agency");
        $elastic_search = $params->get("search");
        $page_number = $params->get("page");

        global $base_url;
        $clientFactory = \Drupal::service('http_client_factory');
        $client = $clientFactory->fromOptions(['verify' => FALSE]);
        $response = $client->get($base_url . '/dexiApi/search?agency=' . $elastic_agency . '&queryString=' . $elastic_search . '&page=' . $page_number);
        $response_content = $response->getBody()->getContents();
        $body = Json::decode($response_content);


        $build = array(
            '#cache' => array(
                'max-age' => 0,
            ),
        );

        return (new ResourceResponse($body))->addCacheableDependency($build);
    }

    /**
     * Constructs a Drupal\rest\Plugin\ResourceBase object.
     *
     * @param array $configuration
     *   A configuration array containing information about the plugin instance.
     * @param string $plugin_id
     *   The plugin_id for the plugin instance.
     * @param mixed $plugin_definition
     *   The plugin implementation definition.
     * @param array $serializer_formats
     *   The available serialization formats.
     * @param \Psr\Log\LoggerInterface $logger
     *   A logger instance.
     */
    public function __construct(
        array $configuration,
        $plugin_id,
        $plugin_definition,
        array $serializer_formats,
        LoggerInterface $logger,
        EntityManagerInterface $entity_manager,
        AccountProxyInterface $current_user) {
        parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);

        $this->entityManager = $entity_manager;
        $this->currentUser = $current_user;
    }

    /**
     * {@inheritdoc}
     */
    public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
        return new static(
            $configuration,
            $plugin_id,
            $plugin_definition,
            $container->getParameter('serializer.formats'),
            $container->get('logger.factory')->get('rest'),
            $container->get('entity.manager'),
            $container->get('current_user')
        );
    }
}