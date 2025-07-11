<?php
/**
 * Handler for persistent data files
 */

/**
 * Handler for persistent data files
 *
 * @package Lilina
 */
class DataHandler {
    /**
     * Directory to store data.
     *
     * @since 1.0
     *
     * @var string
     */
    protected $directory;

    /**
     * Constructor, duh.
     *
     * @since 1.0
     * @uses $directory Holds the data directory, which the constructor sets.
     *
     * @param string $directory
     */
    public function __construct($directory) {
        
            $directory .= '/';

        $this->directory = (string) $directory;
    }

    public function save($filename, $content, $old_filename = false) {

        $file = $this->directory . $filename;

        if($old_filename ) {
            $old_content = $this->load($old_filename);
            $old_contentArray = explode('|', $old_content);
            $length = count($old_contentArray);
            $data = '';
            if($length > 1){
                for($i = 1; $i < $length; $i++){
                   $data .= '|'. $old_contentArray[$i];
                }
            }
            $content = $content . $data;
            $this->delete($old_filename);
        }

        if(!$this->put($file, $content)) {
            trigger_error(get_class($this) . " error: Couldn't write to $file", E_USER_WARNING);
            return false;
        }

        return true;
    }

    protected function put($file, $data, $mode = false) {
        if(file_exists($file) && file_get_contents($file) === $data) {
            touch($file);
            return true;
        }

        file_put_contents($file, $data);
        $this->chmod($file, $mode);
        return true;

    }
    protected function chmod($file, $mode = false){
        if(!$mode)
            $mode = 0644;
        return @chmod($file, $mode);
    }

    public function load($filename) {
        return $this->get($this->directory . $filename);
    }

    protected function get($filename) {
        if(!$this->check($filename))
            return null;

        return file_get_contents($filename);
    }

    protected function check($filename){
        return file_exists($filename);
    }

    public function delete($filename) {
        return unlink($this->directory . $filename);
    }

    public function getAllFiles(){
        $now = time();
        $path = $this->directory;
        $files = scandir($path);
        $files_array = array();
        foreach($files as $file) {
            if ($file != "." && $file != "..") {
                $modification = filectime($path . $file);
                if($now - $modification > 60 * 3) {
                    $files_array[] = $file;
                }
            }
        }
        return $files_array;
    }

    public function getIndex($filename) {
        $jsons = $this->load($filename);
        $jsonArray = explode('|', $jsons);
        return count($jsonArray);
    }

}


