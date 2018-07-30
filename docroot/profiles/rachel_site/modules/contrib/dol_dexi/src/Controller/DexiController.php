<?php
/**
 * @file
 * Contains \Drupal\dol_dexi\Controller\DexiController.
 */

namespace Drupal\dol_dexi\Controller;

use Drupal\Core\Controller\ControllerBase;

class DexiController extends ControllerBase {
    public function content() {
        $build = array(
          '#theme' => 'elastic_search',
          '#attached' => array(
              'library' => array(
                  'dol_dexi/elasticsearch-scripts',
                ),
            ),
        );
        return $build;
    }
}